'use strict';

(function () {
  let playTimer;
  tableau.extensions.initializeAsync({'configure': configure}).then(function () {
    showDetail();
    document.getElementById('play-button').addEventListener('click', onClickPlayButton);
  });

  function configure() {
    let currentUrl = location.href;
    let url = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + '/config.html';
    tableau.extensions.ui.displayDialogAsync(url,'',{ height: 400, width: 500 }).then((closePayload) => {
      showDetail();
    }).catch((err) => {
      console.log('Error while configuring: ' + err.toString());
    });
  }

  function onClickPlayButton() {
    if (!playTimer) {
      let pid = tableau.extensions.settings.get('para-id');
      let speed = tableau.extensions.settings.get('speed');
      let b = document.getElementById('play-button');
      b.children[0].className = 'play-icon-start';
      onPlay(pid, speed);
    } else {
      clearInterval(playTimer);
      afterStop();
    }
  }

  function onPlay(pid, speed) {
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
      for (let p of parameters) {
        if (p.id == pid) {
          let dr = p.allowableValues;
          switch(dr.type) {
            case tableau.ParameterValueType.List:
              let values = dr.allowableValues;
              let idx = 0;
              playTimer = setInterval(() => {
                p.changeValueAsync(values[idx].value);
                idx++;
                if (idx >= values.length) {
                  clearInterval(playTimer);
                  afterStop();
                }
              }, speed * 1000)
              break;
            case tableau.ParameterValueType.Range:
              let v = dr.minValue;
              playTimer = setInterval(() => {
                p.changeValueAsync(v);
                v += dr.stepSize;
                if (v > dr.maxValue) {
                  clearInterval(playTimer);
                  afterStop();
                }
              }, speed * 1000);
          }
          break;
        }
      }
    });
  }

  function showDetail() {
    let pid = tableau.extensions.settings.get('para-id');
    let speed = tableau.extensions.settings.get('speed');
    let showParaName = tableau.extensions.settings.get('show-para-name');
    let showSpeed = tableau.extensions.settings.get('show-speed');

    let settingsDetail = document.getElementById('settings-detail');
    while (settingsDetail.firstChild) {
      settingsDetail.removeChild(settingsDetail.firstChild);
    }
    if (showParaName === 'y') {
      let nameNode = document.createElement('p');
      settingsDetail.appendChild(nameNode);
      tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        for (let p of parameters) {
          if (p.id == pid) {
            nameNode.innerHTML = p.name;
          }
        }
      });
    }
    if (showSpeed === 'y') {
      let speedNode = document.createElement('p');
      speedNode.innerHTML = speed + ' s';
      settingsDetail.appendChild(speedNode);
    }
  }

  function afterStop() {
    playTimer = null;
    let b = document.getElementById('play-button');
    b.children[0].className = 'play-icon-stop';
  }
})();