import { io } from "socket.io-client";

const ENDPOINT = "http://nginx:8080"; 
const socket = io(ENDPOINT);

export default socket;
