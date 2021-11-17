import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
import os
import requests


class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def post(self):
        base = self.request.headers["target"]
        xsrf = self.get_cookie("_xsrf")

        path = f"{base}/services/Feedback/submit"
        token = os.getenv("JUPYTERHUB_API_TOKEN")
        r = requests.post(path, data=self.request.body, headers={"Content-Type": "application/json", "Authorization": f"token {token}"}, cookies={"_xsrf": xsrf})
        self.set_status(r.status_code)
        self.finish()


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "livefeedback", "submit")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
