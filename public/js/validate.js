  function isValidForm() {
        var id = document.getElementById("uid").value;
        id = id.toUpperCase();
    //  console.log(id);
        var arhn = id.substring(0,4);
        var code = id.substring(4,8);
    //  console.log(arhn);
    //  console.log(code);
        if (id.length != 8 || arhn != "ARHN")  {
            Materialize.toast('Invalid ID',6000);
            document.getElementById("msg").innerHTML = "Invalid ID"
            return false;
        }
        if(isNaN(code)) {
            Materialize.toast('Invalid ID',6000);
            document.getElementById("msg").innerHTML = "Invalid ID";
            return false;
        }
        <% for(var i=0;i<studentsid.length;i++) { %>
            console.log("<%= studentsid[i] %>"+" "+id)
            if(id=="<%= studentsid[i] %>") {
            Materialize.toast('Aarohan ID already exists',6000);
            return false;
            }
        <% } %>
        return true;
    }
