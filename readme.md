# Kindi
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![Known Vulnerabilities](https://snyk.io/test/github/shaselle/kindi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/shaselle/kindi?targetFile=package.json)
---
#### Kindi is very opinionated progressive web app library, that values lightness and performance.
Am putting together an innovative system for building progress web apps.
Kindi is an experiment to produce a  PWA module. 

### Qualities
##### 1. Light
##### 2. Declarative
##### 3. Efficient
##### 4. Expressive

### Features
##### 1. Dynamic Functional Templating.
```js
import {h1,body} from "kindi.js"
body({},
    h1({
        css:`:host{
            color: white;
            background: blue;
        }`,
        text:"Example Heading",
        click:elem=>{
            elem.css(`:host{
                color: white;
                background: blue;
            }`)
        }
    })
)
```
