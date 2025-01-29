# Open source cdn(font) links for those who want them.

This project was created for me to include fonts that are not available in [Google Fonts](https://fonts.google.com/) directly from my own open source project, without adding them from some sites I find unreliable. Here are some fonts that I like but are not included in [Google Fonts](https://fonts.google.com/);

| Font Name           | How to use in html?                                                                   |
|---------------------|---------------------------------------------------------------------------------------|
| <b>Ubuntu Title</b> | `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fvonts/ubuntu-title">` |

license : [MIT](LICENSE)

## Setting up Config File

`fvonts.config.js`
```js
module.exports = {
    config: {
        // config options here...
    }
}
```

## Config Options

### replacements
placeholding variables for your template files. Simple usage below.

`fvonts.config.js`
```js
module.exports = {
    config: {
        replacements: {
            "my-page": "https://ahmetcanisik.com"
        }
    }
}
```

`template/cv.md`
```js
...Visit [my personel website]($fv.my-page).
```