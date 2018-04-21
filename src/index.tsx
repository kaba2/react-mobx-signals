import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppUi from 'src/ui/app-ui';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(
  <AppUi />,
  document.getElementById('root') as HTMLElement,
);
registerServiceWorker();
