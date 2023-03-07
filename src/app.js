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

const getErrorCode = (error) => {
  const isAxiosError = (error.name === 'AxiosError');
  if (isAxiosError && error.message === 'Network Error') {
    return 'networkError';
  }
  if (isAxiosError && error.message.includes('timeout')) {
    return 'timeoutError';
  }
  return 'parserError';
};

const addProxy = (originUrl) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('url', originUrl);
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};

const fetchData = (url, watchedState) => {
  watchedState.loadingProcess = {
    status: 'loading',
    error: '',
  };

  axios
    .get(addProxy(url), { timeout: 10000 })
    .then((response) => {
      const { feed, posts } = parser(response.data.contents, url);
      feed.feedID = _.uniqueId();
      posts.forEach((elem) => {
        elem.postID = _.uniqueId();
        elem.feedID = feed.feedID;
      });
      watchedState.posts.unshift(posts);
      watchedState.feeds.unshift(feed);
      watchedState.loadingProcess = {
        status: 'success',
        error: '',
      };
    })
    .catch((error) => {
      watchedState.loadingProcess = {
        status: 'fail',
        error: getErrorCode(error),
      };
    });
};

const updatePosts = (watchedState) => {
  const links = watchedState.feeds.map((feed) => feed.linkFeed);
  const promises = links.map((link) => axios
    .get(addProxy(link), { timeout: 10000 })
    .then((response) => {
      const { feed, posts } = parser(response.data.contents);
      const currentPosts = onChange.target(watchedState.posts).flat();
      const newPosts = _.differenceBy(posts, currentPosts, 'titlePost');
      if (newPosts.length > 0) {
        watchedState.feeds.forEach((stateFeed) => {
          if (stateFeed.descriptionFeed === feed.descriptionFeed) {
            newPosts.forEach((elem) => {
              elem.postID = _.uniqueId();
              elem.feedID = stateFeed.feedID;
            });
          }
        });
        watchedState.posts = [...newPosts, ...watchedState.posts];
      }
    }));

  return Promise.all(promises)
    .finally(setTimeout(() => updatePosts(watchedState), 5000));
};

const validateUrl = (url, parsedUrl) => {
  const schema = string().url().required().notOneOf(parsedUrl);
  return schema.validate(url)
    .then(() => null)
    .catch((error) => error.message);
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
    form: {
      status: 'filling',
      error: '',
    },
    loadingProcess: {
      status: 'idle',
      error: '',
    },
    posts: [],
    feeds: [],
    viewedPosts: [],
    modalPost: '',
  };

  const watchedState = watch(elements, initialState, i18n);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    elements.input.focus();
    const formData = new FormData(event.target);
    const url = formData.get('url');
    const parsedUrl = watchedState.feeds.map((feed) => feed.linkFeed);
    validateUrl(url, parsedUrl)
      .then((error) => {
        if (error) {
          watchedState.form = {
            status: 'invalid',
            error,
          };
        } else {
          watchedState.form = {
            status: 'filling',
            error: '',
          };

          fetchData(url, watchedState);
        }
      });
  });

  updatePosts(watchedState);

  elements.postsContainer.addEventListener('click', (event) => {
    const { target } = event;
    const idPost = target.getAttribute('data-id');
    const modalPost = watchedState.posts.flat().filter((post) => post.postID === idPost);
    const selectedElement = target.tagName;
    switch (selectedElement) {
      case 'A':
        watchedState.viewedPosts.push(modalPost);
        break;
      case 'BUTTON':
        watchedState.viewedPosts.push(modalPost);
        watchedState.modalPost = modalPost;
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
