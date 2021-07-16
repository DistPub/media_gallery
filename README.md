media tools for advertisement industry worker

### Codename

for develop reason, all external resources defined by codename in codebase.

* `zgdy` => `♀dδùγìnɡ♂`
* `zgvg` => `ぷひíɡζζé`
* `zgwb` => `┕ωéιьǒ┕`
* `zgtt` => `o﹎τòùτＩαò┌↘`
* `zgxhs` => `☆χíαǒんǒńɡsんú☆`

### Encrypt Endpoint

for develop reason, all external endpoints encrypted by base64.

### Secure Local Develop

1. install `mitmproxy`
    >pip install -r requirements_dev.txt
1. reverse proxy your port
    >mitmproxy -p 4443 --mode reverse:http://127.0.0.1:7000/
1. import root cert file to Chrome
    >certutil -d sql:$HOME/.pki/nssdb -A -t C -n mitmproxy -i ~/.mitmproxy/mitmproxy-ca-cert.pem
1. configure Chrome to trust cert
    >open `chrome://settings/certificates`, switch to `Authorities` tab, find `org-mitmproxy`, trust it
1. restart Chrome

### Note

* django `runserver` command must set `--nostatic` option!
