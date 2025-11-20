import axios from "axios";

const fetchHTML = async (url: string, timeout = 15000): Promise<string> => {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FreshbrandScraper/1.0; +https://tusitio.local)"
    },
    timeout
  });
  return res.data;
}

export default fetchHTML