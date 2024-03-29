"""media_gallery URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include

urlpatterns = [
    path('zgdy/', include(('zgdy.urls', 'zgdy'))),
    path('libp2p/', include(('libp2p.urls', 'libp2p'))),
    path('zgvg/', include(('zgvg.urls', 'zgvg'))),
    path('zgwb/', include(('zgwb.urls', 'zgwb'))),
    path('zgtt/', include(('zgtt.urls', 'zgtt'))),
    path('zyms/', include(('zyms.urls', 'zyms'))),
    path('zgxhs/', include(('zgxhs.urls', 'zgxhs'))),
    path('avideo-chat/', include(('avideo_chat.urls', 'avideo_chat'))),
]
