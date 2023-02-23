import { setLocale, string } from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import parser from './parser.js';
import watch from './watcher.js';
import resources from './locales/index.js';
import errors from './locales/errors.js';

const defaultLanguage = 'ru';

const fetchingData = (url) => axios
  .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => response.data.contents)
  .catch(() => {
    throw new Error('networkError');
  });

const updatePosts = (watchedState) => {
  const links = watchedState.feeds.map((feed) => feed.linkFeed);
  const promises = links.map((link) => fetchingData(link)
    .then((response) => {
      const { posts } = parser(response);
      const currentPosts = onChange.target(watchedState.posts).flat();
      const newPosts = _.differenceBy(posts, currentPosts, 'titlePost');
      if (newPosts.length > 0) {
        newPosts.forEach((elem) => {
          elem.postID = _.uniqueId();
        });
        watchedState.posts = [...newPosts, ...watchedState.posts];
      }
    }));

  return Promise.all(promises)
    .finally(setTimeout(() => updatePosts(watchedState), 5000));
};

const validateUrl = (url, parsedUrl) => {
  const schema = string().url().required().notOneOf(parsedUrl);
  return schema.validate(url);
};

const runApp = (i18n) => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    submitButton: document.querySelector('button[type="submit"]'),
    postsLink: document.querySelector('a[target="_blank"]'),
    buttonPost: document.querySelector('button[data-bs-toggle="modal"]'),
    modal: {
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalButton: document.querySelector('a[role="button"]'),
    },
  };

  const initialState = {
    status: 'waiting',
    form: {
      valid: false,
      error: '',
    },
    stateUI: {
      viewedPosts: [],
      modalPost: null,
    },
    posts: [],
    feeds: [],
  };

  const watchedState = watch(elements, initialState, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.status = 'loading';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const parsedUrl = watchedState.feeds.map((feed) => feed.linkFeed);
    validateUrl(url, parsedUrl)
      .then(() => fetchingData(url))
      .then((response) => parser(response, url))
      .then((parsedData) => {
        const { feed, posts } = parsedData;
        posts.forEach((elem) => {
          elem.postID = _.uniqueId();
        });
        watchedState.posts.unshift(posts);
        watchedState.feeds.unshift(feed);
        watchedState.form.valid = true;
        watchedState.status = 'waiting';
      })
      .catch((err) => {
        watchedState.form.valid = false;
        watchedState.form.error = err.message;
        watchedState.status = 'error!';
      });
    elements.form.reset();
    elements.input.focus();
  });

  updatePosts(watchedState);

  elements.postsContainer.addEventListener('click', (e) => {
    const { target } = e;
    const idPost = target.getAttribute('data-id');
    const modalPost = watchedState.posts.flat().filter((post) => post.postID === idPost);
    const selectedElement = target.tagName;
    switch (selectedElement) {
      case 'A':
        watchedState.stateUI.viewedPosts.push(modalPost);
        break;
      case 'BUTTON':
        watchedState.stateUI.viewedPosts.push(modalPost);
        watchedState.stateUI.modalPost = (modalPost);
        break;
      default:
        throw new Error(`this ${target} didn't in case`);
    }
  });
};

export default () => {
  const i18n = i18next.createInstance();

  i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => {
      setLocale(errors);
      runApp(i18n);
    });
};
