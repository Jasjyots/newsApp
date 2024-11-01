import moment from 'moment';
import React, {useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';

export default function NewsTile({
  content,
  swippedNews,
  deleteSwippedNews = () => {},
  pinNews = () => {},
  pinnedNews = [],
  unpinNews = () => {},
}) {
  const {
    urlToImage = '',
    source = {},
    publishedAt = '',
    description = '',
    author = '',
  } = content;

  const fallBackImageUrl =
    'https://cdn.icon-icons.com/icons2/70/PNG/512/bbc_news_14062.png';

  const actionItems = {
    delete: 'Delete',
    pin: 'Pin',
    unpin: 'Unpin',
  };

  const marginLeftWhenSwiped = -100;
  const marginRightWhenSwiped = 50;

  const checkWhetherCurrentNewsSwiped = useMemo(
    () => swippedNews?.content === content?.content,
    [swippedNews],
  );

  const checkWhetherIncludedInPinned = () =>
    pinnedNews?.find(item => item?.description == content?.description);

  const LeftView = () => (
    <View style={[styles.leftView]}>
      <View style={[styles.rowView('flex-start'), styles.centerView]}>
        <Image
          style={styles.newsChannelImage}
          source={{
            uri: urlToImage || fallBackImageUrl,
          }}
        />
        <Text style={styles.channelName}>{source?.name}</Text>
      </View>
      <View style={styles.marginVerticalBwComponents(8)} />
      <Text numberOfLines={3} style={styles.newsDescription}>
        {description}
      </Text>
      <View style={styles.marginVerticalBwComponents(4)} />
      <Text numberOfLines={1} style={styles.author}>
        {author}
      </Text>
    </View>
  );

  const RightView = () => (
    <View
      style={{
        marginRight: checkWhetherCurrentNewsSwiped ? marginRightWhenSwiped : 0,
      }}>
      <View style={[styles.centerView]}>
        <Text style={styles.dateStyle}>
          {moment(publishedAt).format('H:MM A')}
        </Text>
        <View style={styles.marginVerticalBwComponents(8)} />
        <View>
          <Image
            style={styles.newsImage}
            source={{
              uri: urlToImage || fallBackImageUrl,
            }}
          />
        </View>
      </View>
    </View>
  );

  const handleDelete = () => {
    deleteSwippedNews();
  };

  const handlePinOrUnpin = () => {
    if (checkWhetherIncludedInPinned()) unpinNews(content);
    else pinNews();
  };

  const SwipableActions = () => (
    <View style={styles.actionsView}>
      <TouchableOpacity style={{alignItems: 'center'}} onPress={handleDelete}>
        <Image
          style={styles.actionIcon}
          source={require('../assets/images/delete.png')}
        />
        <Text numberOfLines={1} style={styles.actionText}>
          {actionItems.delete}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handlePinOrUnpin}
        style={{alignItems: 'center'}}>
        <View style={styles.marginVerticalBwComponents(8)} />
        <Image
          style={styles.actionIcon}
          source={require('../assets/images/pin.png')}
        />
        <Text numberOfLines={1} style={styles.actionText}>
          {checkWhetherIncludedInPinned() ? actionItems.unpin : actionItems.pin}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        {
          marginLeft: checkWhetherCurrentNewsSwiped ? marginLeftWhenSwiped : 0,
        },
        styles.rowView(),
        styles.mainContainer,
      ]}>
      <LeftView />
      <RightView />
      {checkWhetherCurrentNewsSwiped && <SwipableActions />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 20,
  },
  rowView: (justify = 'space-between') => {
    return {flexDirection: 'row', justifyContent: justify};
  },
  marginVerticalBwComponents: (val = 24) => {
    return {
      marginVertical: val,
    };
  },
  actionIcon: {
    height: 16,
    width: 16,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 10,
    marginTop: 4,
  },

  leftView: {
    flex: 0.8,
  },

  actionsView: {
    position: 'absolute',
    right: -36,
    backgroundColor: '#4BBDFC',
    height: '100%',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  newsChannelImage: {
    height: 18,
    width: 18,
  },
  newsImage: {
    height: 60,
    width: 68,
    borderRadius: 12,
  },
  centerView: {
    alignItems: 'center',
  },
  author: {
    color: '#818181',
    fontWeight: '500',
    fontSize: 10,
  },

  channelName: {
    fontWeight: '400',
    color: '#808080',
    fontSize: 13,
    lineHeight: 14,
    textAlign: 'center',
    marginLeft: 8,
  },
  dateStyle: {
    height: 16,
    color: '#000000',
    fontWeight: '400',
    opacity: 0.7,
  },
  newsDescription: {
    flex: 0.8,
    fontWeight: '700',
    lineHeight: 20,
  },
  pinnedIcon: {
    height: 20,
    width: 20,
  },
});
