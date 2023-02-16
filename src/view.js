const disableButton = (state, container) => {
  if (state.status === 'loading') {
    container.submitButton.classList.add('disabled');
  } else {
    container.submitButton.classList.remove('disabled');
  }
};

const renderValid = (container, i18n) => {
  const inputField = container.input;
  const inputFeedback = container.feedback;
  inputField.classList.remove('is-invalid');
  inputFeedback.classList.remove('text-danger');
  inputFeedback.classList.add('text-success');
  inputFeedback.textContent = i18n.t('success');
};

const renderError = (state, container, i18n) => {
  const errors = {
    repeatUrl: () => i18n.t('errors.repeatUrl'),
    invalidUrl: () => i18n.t('errors.invalidUrl'),
    parserError: () => i18n.t('errors.parserError'),
    networkError: () => i18n.t('errors.networkError'),
  };

  const handleError = (errorCode) => errors[errorCode]();
  const inputField = container.input;
  const inputFeedback = container.feedback;
  inputField.classList.add('is-invalid');
  inputFeedback.classList.add('text-danger');
  inputFeedback.classList.remove('text-success');
  inputFeedback.textContent = handleError(state.form.error);
};

const renderFeeds = (state, container) => {
  const { feedsContainer } = container;
  feedsContainer.innerHTML = '';
  const cardBorder = document.createElement('div');
  cardBorder.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const feedsTitle = document.createElement('h2');
  feedsTitle.classList.add('card-title', 'h4');
  feedsTitle.textContent = 'Фиды';
  feedsContainer.append(cardBorder);
  cardBorder.append(cardBody);
  cardBody.append(feedsTitle);
  const ulFeeds = document.createElement('ul');
  ulFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  cardBorder.append(ulFeeds);
  ulFeeds.innerHTML = '';
  state.feeds.forEach((feed) => {
    const liFeed = document.createElement('li');
    liFeed.classList.add('list-group-item', 'border-0', 'border-end-0');
    const titleFeed = document.createElement('h3');
    titleFeed.classList.add('h6', 'm-0');
    titleFeed.textContent = feed.titleFeed;
    const descriptionFeed = document.createElement('p');
    descriptionFeed.classList.add('m-0', 'small', 'text-black-50');
    descriptionFeed.textContent = feed.descriptionFeed;
    liFeed.append(titleFeed, descriptionFeed);
    ulFeeds.append(liFeed);
  });

  feedsContainer.append(ulFeeds);
};

const renderPosts = (state, container) => {
  const { postsContainer } = container;
  postsContainer.innerHTML = '';
  const cardBorder = document.createElement('div');
  cardBorder.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const postTitle = document.createElement('h2');
  postTitle.classList.add('card-title', 'h4');
  postTitle.textContent = 'Посты';
  postsContainer.append(cardBorder);
  cardBorder.append(cardBody);
  cardBody.append(postTitle);
  const ulPosts = document.createElement('ul');
  ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
  cardBorder.append(ulPosts);
  ulPosts.innerHTML = '';
  state.posts.flat().forEach((post) => {
    const liPost = document.createElement('li');
    liPost.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const anchorPost = document.createElement('a');
    anchorPost.setAttribute('href', `${post.linkPost}`);
    anchorPost.classList.add('fw-bold');
    anchorPost.setAttribute('data-id', `${post.postID}`);
    anchorPost.setAttribute('target', '_blank');
    anchorPost.setAttribute('rel', 'noopener noreferrer');
    anchorPost.textContent = post.titlePost;
    liPost.append(anchorPost);
    ulPosts.append(liPost);
  });
};

export default (state, container, i18n) => (path) => {
  switch (path) {
    case 'status':
      disableButton(state, container);
      break;
    case 'form.valid':
      renderValid(container, i18n);
      break;
    case 'form.error':
      renderError(state, container, i18n);
      break;
    case 'feeds':
      renderFeeds(state, container);
      break;
    case 'posts':
      renderPosts(state, container);
      break;
    default:
      throw new Error(`${path} is a wrong path`);
  }
};
