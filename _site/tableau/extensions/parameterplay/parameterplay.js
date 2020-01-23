'use strict';

(function () {
  const playButtonId = 'playbutton1';
  let playTimer;

  tableau.extensions.initializeAsync({'configure': configure}).then(function () {
    const settings = window.tableau.extensions.settings.getAll();
    if (settings.configured !== 'true') {
        configure();
    } else {
        updatePage(settings);
    }
    document.getElementById(playButtonId).addEventListener('click', onClickPlayButton);
  });

  function configure() {
    let currentUrl = location.href;
    let url = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + '/config.html';
    tableau.extensions.ui.displayDialogAsync(url,'',{ height: 400, width: 500 }).then((closePayload) => {
      updatePage(window.tableau.extensions.settings.getAll());
    }).catch((err) => {
      switch (err.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user.");
          break;
        default:
          console.error('Error while configuring: ' + err.toString());
      }
    });
  }

  function onClickPlayButton() {
    if (!playTimer) {
      let pid = tableau.extensions.settings.get('para-id');
      let speed = tableau.extensions.settings.get('speed');
      let b = document.getElementById(playButtonId);
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
              playList(p, speed);
              break;
            case tableau.ParameterValueType.Range:
              playRange(p, speed);
              break;
          }
          break;
        }
      }
    });
  }

  function playList(p, speed) {
    let dr = p.allowableValues;
    let values = dr.allowableValues;
    let idx = 0;
    playTimer = setInterval(() => {
      p.changeValueAsync(values[idx].formattedValue);
      idx++;
      if (idx >= values.length) {
        clearInterval(playTimer);
        afterStop();
      }
    }, speed * 1000);
  }

  function playRange(p, speed) {
    let dr = p.allowableValues;
    let min = dr.minValue.value;
    let max = dr.maxValue.value;
    if (min == undefined || max == undefined) {
      return;
    }
    let step = dr.stepSize;
    if (isNaN(step)) { step = 1; }

    switch (p.dataType) {
      case tableau.DataType.Int:
      case tableau.DataType.Float:
        let v = Number(min);
        playTimer = setInterval(() => {
          p.changeValueAsync(v);
          v += step;
          if (v > Number(max)) {
            clearInterval(playTimer);
            afterStop();
          }
        }, speed * 1000);
        break;
      case tableau.DataType.Date:
      case tableau.DataType.DateTime:
        let start = new Date(min);
        let end = new Date(max);
        let stepPeriod = dr.dateStepPeriod;
        playTimer = setInterval(() => {
          p.changeValueAsync(start);
          switch (stepPeriod) {
            case tableau.PeriodType.Seconds:
              start.setSeconds(start.getSeconds() + step);
              break;
            case tableau.PeriodType.Minutes:
              start.setMinutes(start.getMinutes() + step);
              break;
            case tableau.PeriodType.Hours:
              start.setHours(start.getHours() + step);
              break;
            case tableau.PeriodType.Days:
              start.setDate(start.getDate() + step);
              break;
            case tableau.PeriodType.Weeks:
              start.setDate(start.getDate() + step * 7);
              break;
            case tableau.PeriodType.Months:
              start.setMonth(start.getMonth() + step);
              break;
            case tableau.PeriodType.Quarters:
              start.setMonth(start.getMonth() + step * 3);
              break;
            case tableau.PeriodType.Years:
              start.setFullYear(start.getFullYear() + step);
          }
          if (start.getTime() > end.getTime()) {
            clearInterval(playTimer);
            afterStop();
          }
        }, speed * 1000);
      default:
        break;
    }
  }

  function updatePage(settings) {
    let pid = settings['para-id'];
    let speed = settings['speed'];
    let showParaName = settings['show-para-name'];
    let showSpeed = settings['show-speed'];

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
    let b = document.getElementById(playButtonId);
    b.children[0].className = 'play-icon-stop';
  }
})();