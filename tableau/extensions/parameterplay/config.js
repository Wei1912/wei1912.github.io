'use strict';

let parameterDict = {};

(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      // set style
      let container = document.getElementsByClassName('container')[0];
      container.style.marginTop = "20px";
      container.style.fontSize = "larger";
      // list all parameters
      let ps = document.getElementById('para-select');
      tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        let pid = tableau.extensions.settings.get('para-id');
        parameters.forEach(function (p) {
          parameterDict[p.id] = p;
          let o = document.createElement('option');
          o.value = p.id;
          o.text = p.name;
          if (pid && pid == p.id) {
            o.selected = 'selected';
          }
          ps.add(o);
        });
        if (!pid) {
          ps.selectedIndex = 0;
        }
        showParameterDetail();
      });
      // set other values
      let speed = tableau.extensions.settings.get('speed');
      if (!speed) {
        speed = 1;
      }
      document.getElementById('speed').value = speed;
      let showParaName = tableau.extensions.settings.get('show-para-name');
      if (showParaName) {
        document.getElementById('show-para-name').value = showParaName;
      }
      let showSpeed = tableau.extensions.settings.get('show-speed');
      if (showSpeed) {
        document.getElementById('show-speed').value = showSpeed;
      }
    });

    // add OnChange event to paramenters select node.
    let parameterSelect = document.getElementById('para-select');
    parameterSelect.addEventListener('change', showParameterDetail);
    // add OnClick event to Cancle button
    let cancelButton = document.getElementById('cancel-button');
    cancelButton.addEventListener('click', onClickCancleButton)
    // add OnClick event to OK button
    let okButton = document.getElementById('ok-button');
    okButton.addEventListener('click', onClickOKButton);

    // functions
    function showParameterDetail() {
      let parameterSelect = document.getElementById('para-select');
      let pid = parameterSelect.value;
      let parameter = parameterDict[pid];

      let detailDict = {};
      detailDict['Data Type'] = parameter.dataType;
      detailDict['Current Value'] = parameter.currentValue.formattedValue;
      let dr = parameter.allowableValues;
      if (dr) {
        detailDict['Type'] = dr.type;
        let minValue, maxValue;
        switch(dr.type) {
          case tableau.ParameterValueType.All:
            break;
          case tableau.ParameterValueType.List:
            let values = dr.allowableValues;
            minValue = values[0].value;
            maxValue = values[values.length - 1].value;
            break;
          case tableau.ParameterValueType.Range:
            minValue = dr.minValue.value;
            maxValue = dr.maxValue.value;
        }
        if (minValue && maxValue) {
          detailDict['Value'] = '' + minValue + '<br>~<br>' + maxValue;
        }
      }
      // remove old detail tables
      let oldTables = parameterSelect.parentElement.getElementsByTagName('table');
      if (oldTables && oldTables.length > 0) {
        for (let i=0; i<oldTables.length; i++) {
          parameterSelect.parentElement.removeChild(oldTables[i]);
        }
      }
      let tableDetail = document.createElement('table');
      tableDetail.className = 'detail';
      for (let k in detailDict) {
        let tr = document.createElement('tr');
        let th = document.createElement('th');
        let td = document.createElement('td');
        th.innerHTML = k;
        td.innerHTML = detailDict[k];
        tr.appendChild(th);
        tr.appendChild(td);
        tableDetail.appendChild(tr);
      }
      parameterSelect.parentElement.appendChild(tableDetail);
    }

    function onClickCancleButton() {
      tableau.extensions.ui.closeDialog('');
    }
    function onClickOKButton() {
      let pid = document.getElementById('para-select').value;
      let speed = document.getElementById('speed').value;
      let showParaName = document.getElementById('show-para-name').value;
      let showSpeed = document.getElementById('show-speed').value;
      if (isNaN(speed)) { speed = 1; }

      tableau.extensions.settings.set('para-id', pid);
      tableau.extensions.settings.set('speed', speed);
      tableau.extensions.settings.set('show-para-name', showParaName);
      tableau.extensions.settings.set('show-speed', showSpeed);

      tableau.extensions.settings.saveAsync().then(result => {
        console.log(result);
      });
      tableau.extensions.ui.closeDialog('');
     }
})();
