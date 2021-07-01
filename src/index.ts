import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookModel, NotebookActions } from '@jupyterlab/notebook';

import { requestAPI } from './handler';

/**
 * Initialization data for the livefeedback extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'livefeedback:plugin',
  autoStart: true,
  activate: (_app: JupyterFrontEnd) => {
    console.log('JupyterLab extension livefeedback is activated!');

    NotebookActions.executed.connect((_sender, args) => {
      const { notebook } = args;
      const ipynb: INotebookModel | null = notebook.model;
      console.log(ipynb?.toJSON());
      requestAPI<any>('submit', {
        method: 'POST',
        body: JSON.stringify(ipynb?.toJSON())
      })
        .then(data => {
          console.log(data);
        })
        .catch(reason => {
          console.error(
            `The livefeedback server extension appears to be missing.\n${reason}`
          );
        });
    });
  }
};

export default plugin;
