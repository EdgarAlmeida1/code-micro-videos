import { httpVideo } from ".";
import HttpResource from "./http_resource";

const categoryHttp = new HttpResource(httpVideo, "categories");

export default categoryHttp;