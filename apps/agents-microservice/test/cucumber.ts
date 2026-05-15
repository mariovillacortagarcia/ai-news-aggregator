import { setWorldConstructor } from '@cucumber/cucumber';
import { CustomWorld } from './support/custom-world';

setWorldConstructor(CustomWorld);
