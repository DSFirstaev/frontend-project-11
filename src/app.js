import { setLocale, string } from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import parser from './parser.js';
import watch from './watcher.js';
import resources from './locales/index.js';
import locale from './locales/locale.js';

const defaultLanguage = 'ru';

const getErrorCode = (error) => {
  if (error.isParsingError) {
    return 'parserError';
  }
  if (error.code === 'ECONNABORTED') {
    return 'timeoutError';
  }
  if (error.code === 'ERR_NETWORK') {
    return 'networkError';
  }
  return 'unknownError';
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
      const { feed, posts } = parser(response.data.contents);
      feed.url = url;
      feed.id = _.uniqueId();
      posts.forEach((elem) => {
        elem.id = _.uniqueId();
        elem.feedId = feed.id;
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
  const promises = watchedState.feeds.map(({ id, url }) => axios
    .get(addProxy(url), { timeout: 10000 })
    .then((response) => {
      const { posts } = parser(response.data.contents);
      const currentPosts = watchedState.posts.flat();
      const newPosts = _.differenceBy(posts, currentPosts, 'title')
        .map((newPost) => {
          newPost.id = _.uniqueId();
          newPost.feedId = id;
          return newPost;
        });

      watchedState.posts = [...newPosts, ...watchedState.posts];
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
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      button: document.querySelector('a[role="button"]'),
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
    viewedPostsId: new Set(),
    modalPostId: '',
  };

  const watchedState = watch(elements, initialState, i18n);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    elements.input.focus();
    const formData = new FormData(event.target);
    const url = formData.get('url');
    const parsedUrl = watchedState.feeds.map((feed) => feed.url);
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
    const postId = target.getAttribute('data-id');
    if (target.hasAttribute('data-id')) {
      watchedState.viewedPostsId.add(postId);
    }
    if (target.tagName === 'BUTTON') {
      watchedState.modalPostId = postId;
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
      setLocale(locale);
      runApp(i18n);
    });
};
