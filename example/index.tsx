import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

const Root = () => {
  return (
    <div>
      <App />
    </div>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));
