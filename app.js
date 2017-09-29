var express = require("express"),
    app = express(),
    path = __dirname + '/views/',
    router = express.Router(),
    bodyParser = require('body-parser'),
    firebase = require('firebase');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));   // to support URL-encoded bodie


app.set('port', (process.env.PORT || 8000));
app.use(express.static( __dirname + '/public'));
app.set('views', path);
app.set('view engine', 'ejs');

var config = {
  apiKey: "AIzaSyC-Sd37f6e6Ml6ymgy40dgB9y9G3gywu-g",
  authDomain: "aarohan2017-61ac6.firebaseapp.com",
  databaseURL: "https://aarohan2017-61ac6.firebaseio.com/",
  storageBucket: "aarohan2017-61ac6.appspot.com",
};

var schooldetails = {
    schoolname: null,
    facultyname: null,
    facultyemail: null,
    facultyphonono: null
};

firebase.initializeApp(config);
var database = firebase.database();

var ref = database.ref("Schools/");
schools = new Array();
ref.once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {    
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            console.log(key);
            schools.push(key);
        });
});
ref = database.ref("Students/")
studentsid = new Array();
ref.once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            console.log(key);
            studentsid.push(key);
        });
});


app.get("/", function(req, res) {
    console.log("main");
//  console.log(schools);
    res.render('index');
});

app.get("/school_reg", function(req, res){
    schooldetails = {
        schoolname: null,
        facultyname: null,
        facultyemail: null,
        facultyphonono: null
    };
    res.render('schoolRegistration');
});

app.get("/student_reg", function(req, res){
    console.log("student_reg");
    studentdetails = {
          id: null,
          name: null,
          school: null,
          category: null,
          gender: null
    };
    res.render('studentRegistration',{schools});
});


app.post("/reg_school", function(req, res) {
    var sch = req.body.school_name;
    var faq = req.body.faculty_name;
    sch = capitalize(sch);
    faq = capitalize(faq);
    schooldetails = {
        schoolname: sch,
        facultyname: faq,
        facultyemail: req.body.faculty_email,
        facultyphonono: req.body.faculty_phoneno,
        chequename: req.body.cheque_name
    };
    console.log(schooldetails);
    schools.push(schooldetails.schoolname);
    writeSchoolData();
    res.redirect('/school_reg');
});

app.post("/reg_student", function(req, res) {
    selectoption.isStudentValid = true;
    var uid = req.body.uid;
    var str = req.body.name;
    var str1 = capitalize(str);
    uid = uid.toUpperCase();
    if(validateId(uid)) { 
      studentdetails = {
            id: uid,
            name: str1,
            category: req.body.category,
            gender: req.body.gender,
            school: req.body.school,
        };
        console.log(studentdetails +'this one');
        writeStudentData();
        studentsid.push(uid);
    }
    res.redirect('/');
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function capitalize(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function writeSchoolData() {
  firebase.database().ref('Schools/' + schooldetails.schoolname).set({
    faculty: {
        name: schooldetails.facultyname,
        email: schooldetails.facultyemail,
        phoneno: schooldetails.facultyphonono
    },
    chequename: schooldetails.chequename
  });
}