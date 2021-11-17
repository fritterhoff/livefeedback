import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookModel, NotebookActions } from '@jupyterlab/notebook';
import * as nbformat from '@jupyterlab/nbformat';
import { requestAPI } from './handler';
function isLive(cell: nbformat.ICodeCell) {
  const pattern =
    /#\s*LIVE:\s*[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/;
  if (cell.source instanceof Array) {
    return cell.source.find(source => pattern.test(source)) !== undefined;
  } else if (cell.source.match(pattern)) {
    return true;
  }
  return false;
}

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
      if (ipynb) {
        const data: nbformat.INotebookContent =
          ipynb?.toJSON() as nbformat.INotebookContent;
        let live = false;
        data.cells.forEach(cell => {
          if (nbformat.isCode(cell)) {
            cell.outputs = [];
            live = live || isLive(cell);
          }
        });
        if (!live) {
          return;
        }
        requestAPI<any>('submit', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'target':  window.location.protocol + "//"+ window.location.host,
          }
        })
          .then(data => {
            console.log(data);
          })
          .catch(reason => {
            console.error(
              `The livefeedback server extension appears to be missing.\n${reason}`
            );
          });
      }
    });
  }
};

export default plugin;
