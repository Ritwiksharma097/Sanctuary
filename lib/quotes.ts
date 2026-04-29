export const QUOTES = [
  { text: "What you seek is seeking you.", author: "Rumi" },
  { text: "The very existence of a desire is proof of its possibility.", author: "Napoleon Hill" },
  { text: "Hope is a waking dream.", author: "Aristotle" },
  { text: "To wish is to hope, and to hope is to expect.", author: "Ambrose Bierce" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
  { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
  { text: "Throw your dreams into space like a kite, and you do not know what it will bring back.", author: "Anaïs Nin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Stars can't shine without darkness.", author: "Unknown" },
  { text: "Go confidently in the direction of your dreams.", author: "Henry David Thoreau" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Somewhere, something incredible is waiting to be known.", author: "Sharon Begley" },
  { text: "The only way out of the labyrinth of suffering is to forgive.", author: "John Green" },
  { text: "Keep your face always toward the sunshine — shadows will fall behind you.", author: "Walt Whitman" },
  { text: "You are braver than you believe, stronger than you seem.", author: "A.A. Milne" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { text: "The present moment always will have been.", author: "Unknown" },
  { text: "Life is what happens while you are busy making other plans.", author: "John Lennon" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "Do not go where the path may lead; go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "We are all of us stars, and we deserve to twinkle.", author: "Marilyn Monroe" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
];

export function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
