import onChange from 'on-change';

const setFeedbackError = (errorCode, elements, i18n) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.textContent = i18n.t(`errors.${errorCode}`);
};

const handleFormError = (state, elements, i18n) => {
  if (state.form.status === 'filling') {
    return;
  }

  setFeedbackError(state.form.error, elements, i18n);
};

const handleFormActive = (state, elements) => {
  if (state.loadingProcess.status === 'loading') {
    elements.submitButton.classList.add('disabled');
  }
  if (state.loadingProcess.status === 'success') {
    elements.submitButton.classList.remove('disabled');
    elements.form.reset();
  }
  if (state.loadingProcess.status === 'fail') {
    elements.submitButton.classList.remove('disabled');
  }
};

const setFeedbackValid = (state, elements, i18n) => {
  if (state.loadingProcess.status !== 'success') {
    return;
  }
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18n.t('success');
};

const handleloadingProcessError = (state, elements, i18n) => {
  if (state.loadingProcess.status !== 'fail') {
    return;
  }

  setFeedbackError(state.loadingProcess.error, elements, i18n);
};

const handleloadingProcess = (state, elements, i18n) => {
  handleFormActive(state, elements);
  setFeedbackValid(state, elements, i18n);
  handleloadingProcessError(state, elements, i18n);
};

const renderFeeds = (state, elements) => {
  const { feedsContainer } = elements;
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
    liFeed.setAttribute('id', `${feed.id}`);

    const titleFeed = document.createElement('h3');
    titleFeed.classList.add('h6', 'm-0');
    titleFeed.textContent = feed.title;

    const descriptionFeed = document.createElement('p');
    descriptionFeed.classList.add('m-0', 'small', 'text-black-50');
    descriptionFeed.textContent = feed.description;

    liFeed.append(titleFeed, descriptionFeed);
    ulFeeds.append(liFeed);
  });

  feedsContainer.append(ulFeeds);
};

const renderPosts = (state, elements, i18n) => {
  const { postsContainer } = elements;
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
    anchorPost.classList.add('fw-bold');

    anchorPost.setAttribute('href', `${post.link}`);
    anchorPost.setAttribute('target', '_blank');
    anchorPost.setAttribute('rel', 'noopener noreferrer');
    anchorPost.textContent = post.title;

    const buttonPost = document.createElement('button');
    buttonPost.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    buttonPost.setAttribute('type', 'button');
    buttonPost.setAttribute('data-id', `${post.id}`);
    buttonPost.setAttribute('data-bs-toggle', 'modal');
    buttonPost.setAttribute('data-bs-target', '#modal');
    buttonPost.textContent = i18n.t('interface.view');

    if (state.viewedPostsId.has(buttonPost.dataset.id)) {
      anchorPost.classList.remove('fw-bold');
      anchorPost.classList.add('fw-normal', 'link-secondary');
    }

    liPost.append(anchorPost, buttonPost);
    ulPosts.append(liPost);
  });
};

const renderModal = (state, elements) => {
  const modalPost = state.posts.flat().filter((post) => post.id === state.modalPostId);
  const [{ title, description, link }] = modalPost;
  elements.modal.title.textContent = title;
  elements.modal.body.textContent = description;
  elements.modal.button.setAttribute('href', `${link}`);
};

const renderViewedPosts = (state, elements) => {
  const buttonPosts = elements.postsContainer.querySelectorAll('.btn.btn-outline-primary.btn-sm');
  buttonPosts.forEach((button) => {
    if (state.viewedPostsId.has(button.dataset.id)) {
      button.previousSibling.classList.remove('fw-bold');
      button.previousSibling.classList.add('fw-normal', 'link-secondary');
    }
  });
};

export default (elements, initState, i18n) => {
  const watchedState = onChange(initState, (path) => {
    switch (path) {
      case 'form':
        handleFormError(initState, elements, i18n);
        break;
      case 'loadingProcess':
        handleloadingProcess(initState, elements, i18n);
        break;
      case 'feeds':
        renderFeeds(initState, elements);
        break;
      case 'posts':
        renderPosts(initState, elements, i18n);
        break;
      case 'viewedPostsId':
        renderViewedPosts(initState, elements);
        break;
      case 'modalPostId':
        renderModal(initState, elements);
        break;
      default:
        throw new Error(`${path} is a wrong path`);
    }
  });
  return watchedState;
};
