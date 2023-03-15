export default (str) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    error.data = parseError.textContent;
    throw error;
  }
  const feed = {
    title: doc.querySelector('channel title:first-of-type').textContent,
    description: doc.querySelector('channel description:first-of-type').textContent,
  };

  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      title,
      description,
      link,
    };
  });

  return { feed, posts };
};
