FROM jupyter/base-notebook
LABEL Name=live-notebook Version=0.0.1
COPY . /app
USER root 
RUN pip install /app && fix-permissions "${CONDA_DIR}" && \
    fix-permissions "/home/${NB_USER}"

USER ${NB_USER}
RUN jupyter server extension enable --py livefeedback