import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the livefeedback extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'livefeedback:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension livefeedback is activated!');
  }
};

export default plugin;
