from routes.user import router as user_router
from routes.photo import router as photo_router
from routes.ping import router as ping_router

routers = [user_router, photo_router, ping_router]