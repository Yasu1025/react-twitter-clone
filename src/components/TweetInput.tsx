import React, { useState } from 'react'
import styles from './css/tweetInput.module.css'
import { useSelector } from "react-redux"
import { selectUser } from '../features/userSlice'
import { auth, db, storage } from '../firebase'
import { Avatar, Button, IconButton } from '@material-ui/core'
import firebase from 'firebase/app'
import AddPhotoIcon from '@material-ui/icons/AddAPhoto'

const TweetInput = () => {
  const user = useSelector(selectUser);
  const [ tweetMsg, setTweetMsg] = useState('');
  const [ tweetImg, setTweetImg ] = useState<File | null>(null);

  const onChangeImgHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if(e.target.files[0]) {
      setTweetImg(e.target.files[0]);
      e.target.value = "";
    }
  };

  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(tweetImg) {

      // set random char to fileName
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImg.name;
      const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImg);
      uploadTweetImg.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {}, // 進捗
        (err) => {
          alert(err.message)
        },
        async () => {
          await storage.ref('images').child(fileName).getDownloadURL()
            .then( async (url) => {
              await db.collection('posts').add({
                avatar: user.photoURL,
                image: url,
                text: tweetMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName
              })
            })
        }
      )


    } else {
      db.collection('posts').add({
        avatar: user.photoURL,
        image: "",
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName
      })
    }

    setTweetImg(null);
    setTweetMsg('');
  }


  return (
    <>
    <form onSubmit={sendTweet}>
      <div className={styles.tweet_form}>
        <Avatar
          className={styles.tweet_avatar}
          src={user.photoURL}
          onClick={ async () => {
            await auth.signOut();
          }}
        />
        <input
        className={styles.tweet_input}
        placeholder="What's happening?"
        type="text"
        autoFocus
        value={tweetMsg}
        onChange={(e) => setTweetMsg(e.target.value)}
      />
      <IconButton>
        <label>
          <AddPhotoIcon
            className= { tweetImg ? styles.tweet_addIconLoaded : styles.tweet_addIcon }
          />
          <input
            className={styles.tweet_hiddenIcon}
            type="file"
            onChange={onChangeImgHandler}
          />
        </label>
      </IconButton>
      </div>
      <Button
        type="submit"
        className={
          tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
        }
        disabled={!tweetMsg}
      >
        Tweet
      </Button>
      
    </form>

    </>
  )
}

export default TweetInput
