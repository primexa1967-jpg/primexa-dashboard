from fastapi.middleware.wsgi import WSGIMiddleware
from firebase_functions import https_fn
from main import app

fastapi_app = WSGIMiddleware(app)

@https_fn.on_request()
def api(request):
    return fastapi_app(request.scope, request.receive, request.send)
