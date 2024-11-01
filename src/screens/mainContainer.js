import React, {useEffect, useState, useContext, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native';

import {AppContext} from '../../App';
import {getPublishedNews} from '../services';
import NewsTile from '../components/newsTile';
import {useNetworkState} from '../hooks/useNetworkState';

const REMOVED_CONTENT_STRING = '[Removed]';
const TIME_TO_FETCH = 10000;
const INTIAL_NUMBER_OF_ITEMS = 10;
const NUMBER_OF_ITEMS_TO_APPEND = 5;
const STORAGE_KEY = 'NEWSTORE';

export default function MainContainer() {
  const isOnline = useNetworkState();

  const appName = useContext(AppContext);

  const articlesRef = useRef([]);
  const intervalRef = useRef('');

  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [swippedNews, setSwippedNews] = useState({});
  const [newsArticles, setNewsArticles] = useState([]);
  const [pinnedNews, setPinnedNews] = useState([]);

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  useEffect(() => {
    if (isOnline) {
      fetchNewsArticles();
    } else getDataFromStorage();
  }, [isOnline]);

  useEffect(() => {
    if (intervalRef?.current) {
      clearInterval(intervalRef.current);
    }
    if (offset > 0) {
      startInterval();
      appendNewPublishedNews();
    }

    return () => clearInterval(intervalRef.current);
  }, [offset]);

  const startInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setOffset(prev => prev + 1);
    }, TIME_TO_FETCH);
  };

  const deleteSwippedNews = () => {
    setNewsArticles(prev =>
      prev?.filter(item => item?.content !== swippedNews?.content),
    );
    startInterval();
    setSwippedNews({});
  };

  const pinNews = () => {
    const filteredSwippedNews = newsArticles?.filter(
      item => item?.content !== swippedNews?.content,
    );
    const updatedPinnedPosition = pinnedNews?.length ? pinnedNews?.length : 0;
    setPinnedNews([
      ...pinnedNews,
      {
        ...swippedNews,
        pinnedPosition: updatedPinnedPosition,
      },
    ]);

    setNewsArticles(
      sortData(
        [
          {...swippedNews, pinnedPosition: updatedPinnedPosition},
          ...filteredSwippedNews,
        ],
        true,
      ),
    );
    startInterval();
    setSwippedNews({});
  };

  const unPinNews = data => {
    const filteredUnpinnedNews = newsArticles?.filter(
      item => item?.content !== data?.content,
    );
    const filteredfromPinnedNews = pinnedNews?.filter(
      item => item?.content !== data?.content,
    );

    setPinnedNews(filteredfromPinnedNews);

    setNewsArticles(
      sortData(
        [{...data, pinnedPosition: 9999999}, ...filteredUnpinnedNews],
        true,
      ),
    );
    startInterval();
    setSwippedNews({});
  };

  const sortData = (data, orderChange = false) => {
    let sortedData;

    sortedData = data.sort(function (a, b) {
      let x = a?.pinnedPosition;
      let y = b?.pinnedPosition;
      if (x < y) {
        return orderChange ? -1 : 1;
      }
      if (x > y) {
        return orderChange ? 1 : -1;
      }
      return 0;
    });

    return sortedData;
  };

  const appendNewPublishedNews = () => {
    if (articlesRef.current?.length > newsArticles?.length) {
      const newsArticlesToAppend = articlesRef.current.slice(
        newsArticles?.length,
        newsArticles?.length + NUMBER_OF_ITEMS_TO_APPEND,
      );

      const arrayToAppendWithPinnedValues = [
        ...pinnedNews,
        ...newsArticlesToAppend,
        ...newsArticles,
      ];
      const arrayUniqueByKey = [
        ...new Map(
          arrayToAppendWithPinnedValues.map(item => [
            item['description'],
            item,
          ]),
        ).values(),
      ];

      setNewsArticles(sortData(arrayUniqueByKey, true));
    } else {
      storeDataInStorage([]);
    }
  };

  const fetchNewsArticles = () => {
    setLoading(true);

    const params = {
      endpoint: 'everything',
      q: 'tesla',
      from: 'date',
      sortBy: 'publishedAt',
    };

    getPublishedNews(
      params,
      res => {
        res.articles = res?.articles?.map(item => {
          return {...item, pinnedPosition: 999999999999999};
        });

        articlesRef.current = res?.articles;

        setIntialData(res?.articles);
        setLoading(false);
        storeDataInStorage(res?.articles);
      },
      err => {
        setLoading(false);
        setError(err);
      },
    );
  };

  const setIntialData = data => {
    setNewsArticles(data?.slice(0, INTIAL_NUMBER_OF_ITEMS));
    setOffset(1);
  };

  const storeDataInStorage = async data => {
    try {
      const jsonValue = JSON.stringify(data);

      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      setLoading(true);
      fetchNewsArticles();
    }
  };

  const getDataFromStorage = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedData = JSON.parse(data);

      setLoading(false);

      if (parsedData) {
        setIntialData(parsedData);
      }
    } catch (error) {
      setLoading(false);
      setError('No Data to display!');
    }
  };

  const reloadNews = () => {
    appendNewPublishedNews();
    startInterval();
  };

  const HeaderComponent = () => {
    return (
      <View>
        <View style={[styles.headerView, styles.sectionContainer]}>
          <Text style={styles.appName}>{appName}</Text>

          <TouchableWithoutFeedback onPress={reloadNews}>
            <Image
              style={styles.reloadImage}
              source={require('../assets/images/reload.png')}
            />
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.lineView}></View>
      </View>
    );
  };

  const LineViiew = () => <View style={styles.lineView}></View>;

  const Footer = () => <View style={styles.marginView}></View>;

  const onSwipe = (gestureName, item) => {
    const {SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;

    switch (gestureName) {
      case SWIPE_LEFT:
        setSwippedNews(item);
        clearInterval(intervalRef.current);
        break;
      case SWIPE_RIGHT:
        handleTouched();

        break;
    }
  };

  const handleTouched = () => {
    setSwippedNews({});
    startInterval();
  };

  const renderItem = ({item, index}) => {
    if (item?.description == REMOVED_CONTENT_STRING) return <></>;
    return (
      <GestureRecognizer
        onSwipe={direction => onSwipe(direction, item)}
        onSwipeLeft={direction => onSwipe(direction, item)}
        onSwipeRight={direction => onSwipe(direction, item)}
        config={config}
        style={{
          flex: 1,
        }}>
        <TouchableWithoutFeedback onPress={handleTouched}>
          <View style={styles.sectionContainer}>
            <NewsTile
              content={item}
              swippedNews={swippedNews}
              deleteSwippedNews={deleteSwippedNews}
              pinNews={pinNews}
              pinnedNews={pinnedNews}
              unpinNews={unPinNews}
            />
            ;
          </View>
        </TouchableWithoutFeedback>
      </GestureRecognizer>
    );
  };

  if (loading)
    return (
      <View style={styles.centerView}>
        <ActivityIndicator />;
      </View>
    );

  if (error)
    return (
      <View style={styles.centerView}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );

  return (
    <View>
      <HeaderComponent />
      <FlatList
        data={newsArticles}
        renderItem={renderItem}
        keyExtractor={item => item?.publishedAt}
        ItemSeparatorComponent={<LineViiew />}
        ListFooterComponent={<Footer />}
        extraData={newsArticles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerView: {
    alignSelf: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  error: {
    fontSize: 24,
  },
  marginView: {
    marginBottom: 80,
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionContainer: {
    marginHorizontal: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
  },
  lineView: {
    backgroundColor: '#EAEAEA',
    height: 1,
    width: '100%',
    marginTop: 16,
  },
  reloadImage: {
    width: 20,
    height: 20,
    marginTop: 8,
  },
});
