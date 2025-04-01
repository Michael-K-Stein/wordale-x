$env:Path = "C:\Program Files\Git\usr\bin;$($env:Path)"

openssl req -x509 -newkey rsa:4096 -keyout privkey.pem -out fullchain.pem -days 365 -nodes -subj "/CN=wordale-x.eshel.dom" -addext "subjectAltName=DNS:wordale.eshel.dom,DNS:wordale.bis.eshel.dom,DNS:mongo.wordale-x.eshel.dom,DNS:wordale.bis"

openssl x509 -in fullchain.pem -text -noout
