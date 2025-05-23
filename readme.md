## Getting Started

To start building a new web component using Stencil, clone this repo to a new directory:

```bash
git clone https://github.com/clockhash-projects/hash-bot-fe.git hash-bot
cd hash-bot
git remote rm origin
```

and run:

```bash
npm install
npm start
```

To build the component for production, run:

```bash
npm run build
```

To run the unit tests for the components, run:

```bash
npm test
```


```html
<script type="module" src="https://unpkg.com/hash-bot"></script>
<!--
To avoid unpkg.com redirects to the actual file, you can also directly import:
https://cdn.jsdelivr.net/npm/alpha-interface@0.0.1/dist/hash-bot/hash-bot.esm.js
-->
<hash-bot apiurl="apiUrl" iconsize="90" chatbotwidth="300" chatbotheight="400"></hash-bot>
```

This will only load the necessary scripts needed to render `<hash-bot/>`. Once more components of this package are used, they will automatically be loaded lazily.

You can also import the script as part of your `node_modules` in your applications entry file:

```tsx
import 'alpha-interface/dist/hash-bot/hash-bot.esm.js';
```

### Standalone

```tsx
import 'alpha-interface';

function App() {
  return (
    <>
      <div>
        <hash-bot
          apiurl="apiUrl" 
          iconsize="90" 
          chatbotwidth="300" 
          chatbotheight="400"
        ></hash-bot>
      </div>
    </>
  );
}

export default App;
```