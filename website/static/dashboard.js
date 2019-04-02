var statData;
var poolKeys;

//this function is executed when the page's dom is loaded
// assumes jQuery is loaded already
$(function(){
  var dataTable = $("#walletTable").DataTable({
      "order": [[ 0, "desc" ]],
      "pageLength": 5,
      "bLengthChange": false,
      "iDisplayLength": 5
  });
  var cachedWallets = Cookies.get('wallets');
  if(cachedWallets && cachedWallets.length > 0){
    cachedWallets = JSON.parse(cachedWallets);
    for(w in cachedWallets) {
      var wallet = cachedWallets[w].split(',');
      var coin = wallet[0];
      var address = wallet[1];
      dataTable.row.add([
        "<a href=\"/workers/" + address + "\"><img src=\"./static/icons/" + coin + ".png\" height=\"25px\"/> " + address + "</a>",
        "<button id=\"" + address + "\" type=\"button\" class=\"btn btn-danger\" style=\"padding-top: 0; height: 18px;\"><i class=\"fa fa-trash-o\"></i> Delete&nbsp;</button></td>"
      ]).draw(false);
      $('#' + address).click(function(event) {
        if(confirm("Are you sure you want to delete address: " + address)){
          cachedWallets.splice(w, 1);
          Cookies.remove('wallets');
          Cookies.set('wallets', cachedWallets, { expires: 30 });
          location.reload();
        }
      });
    }
  }
  //binds the myFormOnSubmit method below to run as part of your form's onsubmit method
  $('#searchButton').click(myFormOnSubmit);

  //runs when the form is trying to submit
  function myFormOnSubmit(event) {
      var f = $(this);
      // note, you have to match on attribute selectors
      //  you may want to give each of these fields an id=".." attribute as well to select against #IdName
      var search = $('#searchBar').val();
      var isValid = false;

      var coin = "";
      var wallets = Cookies.get('wallets');
      var stored = false;
      if(wallets) {
        wallets = JSON.parse(wallets);
        for(w in wallets) {
          if(wallets[w].split(',')[1] === search) {
            stored = true;
            break;
          }
        }
      }
      if(stored){
        alert('Address Already Stored!');
        event.preventDefault(); //stop submit
        return;
      }
      if(!wallets){
        wallets = [];
      }
      $.each(statData.pools, function(i, v) {
        if(!isValid){
          for(worker in v.workers){
            worker = worker.split('.')[0];
            if(worker === search){
              isValid = true;
              wallets.push(String(i + ',' + worker));
              break;
            }
          }
        }
      });
      if (!isValid) {
        alert('No Address Found!');
        event.preventDefault(); //stop submit
        return;
      } else {
        Cookies.remove('wallets');
        Cookies.set('wallets', wallets, { expires: 30 });
      }
    }
});



$.getJSON('/api/stats', function(data) {
  statData = data;
});
