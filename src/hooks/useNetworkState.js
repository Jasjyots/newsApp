import {useState, useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkState = () => {
  const [connectionStatus, setConnectionStatus] = useState(true);
  const handleNetworkChange = state => {
    setConnectionStatus(state.isConnected);
  };
  useEffect(() => {
    const netInfoSubscription = NetInfo.addEventListener(handleNetworkChange);
    return () => {
      netInfoSubscription?.();
    };
  }, []);
  return connectionStatus;
};
