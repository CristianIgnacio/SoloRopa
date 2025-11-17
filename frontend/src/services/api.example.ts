// import axios from "axios";

const API_URL = "http://localhost:3001/api";

export async function getMessage() {
  const res = await fetch(`${API_URL}/example`);
  return res.json();
}