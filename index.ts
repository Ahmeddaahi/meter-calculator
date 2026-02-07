import { registerRootComponent } from 'expo';
import App from './meter-app/App';

// Proxy the root component to the nested meter-app folder
registerRootComponent(App);
