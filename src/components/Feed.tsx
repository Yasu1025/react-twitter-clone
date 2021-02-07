import React from "react";
import { auth } from '../firebase';
import TweetInput from './TweetInput';
import styles from './css/feed.module.css'

const Feed = () => {
  return (
    <div className={styles.feed}>
      <TweetInput />
      <button onClick={() => auth.signOut()}>Logout(temporary)</button>
    </div>
  );
};

export default Feed;
