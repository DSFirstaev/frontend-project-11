import onChange from 'on-change';

const renderInputAndSubmitButton = (initialState, elements) => {
  if (initialState.loadingProcess.status === 'loading') {
    elements.submitButton.classList.add('disabled');
  }
  if (initialState.loadingProcess.status === 'success') {
    elements.submitButton.classList.remove('disabled');
    elements.form.reset();
  }
  if (initialState.loadingProcess.status === 'fail') {
    elements.submitButton.classList.remove('disabled');
  }
};

const errorsMessage = {
  repeatUrl: (i18n) => i18n.t('errors.repeatUrl'),
  invalidUrl: (i18n) => i18n.t('errors.invalidUrl'),
  parserError: (i18n) => i18n.t('errors.parserError'),
  networkError: (i18n) => i18n.t('errors.networkError'),
  timeoutError: (i18n) => i18n.t('errors.timeoutError'),
};

const renderFeedbackValid = (initialState, elements, i18n) => {
  if (initialState.loadingProcess.status !== 'success') {
    return;
  }
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18n.t('success');
};

const renderFeedbackError = (errorCode, elements, i18n) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.textContent = errorsMessage[errorCode](i18n);
};

const handleFormError = (initialState, elements, i18n) => {
  if (initialState.form.status === 'filling') {
    return;
  }

  renderFeedbackError(initialState.form.error, elements, i18n);
};

const handleloadingProcessError = (initialState, elements, i18n) => {
  if (initialState.loadingProcess.status !== 'fail') {
    return;
  }

  renderFeedbackError(initialState.loadingProcess.error, elements, i18n);
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
  feedsTitle.textContent = '????????';
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

const renderPosts = (state, elements, i18n) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';
  const cardBorder = document.createElement('div');
  cardBorder.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const postTitle = document.createElement('h2');
  postTitle.classList.add('card-title', 'h4');
  postTitle.textContent = '??????????';
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
    const buttonPost = document.createElement('button');
    buttonPost.setAttribute('type', 'button');
    buttonPost.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonPost.setAttribute('data-id', `${post.postID}`);
    buttonPost.setAttribute('data-bs-toggle', 'modal');
    buttonPost.setAttribute('data-bs-target', '#modal');
    buttonPost.textContent = i18n.t('interface.view');
    liPost.append(anchorPost, buttonPost);
    ulPosts.append(liPost);
  });
};

const renderModal = (initState, elements) => {
  const [{ titlePost, descriptionPost, linkPost }] = initState.modalPost;
  elements.modal.modalTitle.textContent = titlePost;
  elements.modal.modalBody.textContent = descriptionPost;
  elements.modal.modalButton.setAttribute('href', `${linkPost}`);
};

const renderViewedPosts = (state, elements) => {
  const anchorsPost = elements.postsContainer.querySelectorAll('.fw-bold');
  const viewedPostTextContent = state.viewedPosts.map((posts) => {
    const [{ titlePost }] = posts;
    return titlePost;
  });
  anchorsPost.forEach((anchor) => {
    if (viewedPostTextContent.includes(anchor.textContent)) {
      anchor.classList.remove('fw-bold');
      anchor.classList.add('fw-normal', 'link-secondary');
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
        renderInputAndSubmitButton(initState, elements);
        renderFeedbackValid(initState, elements, i18n);
        handleloadingProcessError(initState, elements, i18n);
        break;
      case 'feeds':
        renderFeeds(initState, elements);
        break;
      case 'posts':
        renderPosts(initState, elements, i18n);
        break;
      case 'viewedPosts':
        renderViewedPosts(initState, elements);
        break;
      case 'modalPost':
        renderModal(initState, elements);
        break;
      default:
        throw new Error(`${path} is a wrong path`);
    }
  });
  return watchedState;
};
