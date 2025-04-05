export class FeedItem {
  title: string;
  description: string;
  url: string;
  date: string;
  author: string;

  constructor(
    title: string,
    description: string,
    url: string,
    date: string,
    author: string,
  ) {
    this.title = title;
    this.description = description;
    this.url = url;
    this.date = date;
    this.author = author;
  }

  static of(feedItem: Pick<FeedItem, keyof FeedItem>): FeedItem {
    return new FeedItem(
      feedItem.title,
      feedItem.description,
      feedItem.url,
      feedItem.date,
      feedItem.author,
    );
  }
}
