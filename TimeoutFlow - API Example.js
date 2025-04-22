import { after, every, chrono } from 'TimeoutFlow';

after('5s', () => console.log('5 seconds later...'));

const ticker = every('1s', () => console.log('tick'));
ticker.pause();
setTimeout(() => ticker.resume(), 2000);

// Or schedule a sequence
chrono()
  .after('2s', () => console.log('ready'))
  .every('1s', () => console.log('looping'), 5)
  .after('500ms', () => console.log('done'));
