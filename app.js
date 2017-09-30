var express = require("express"),
    app = express(),
    path = __dirname + '/views/',
    router = express.Router(),
    bodyParser = require('body-parser'),
    firebase = require('firebase');

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: false
})); // to support URL-encoded bodie


app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname + '/public'));
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

var studentdetails = {
    id: null,
    name: null,
    school: null,
    category: null,
    gender: null
};

var editStudent = {
    id: null,
    name: null,
    school: null,
    category: null,
    gender: null
}

firebase.initializeApp(config);
var database = firebase.database();

var ref = database.ref("Schools/");
schools = new Array();
ref.once("value").then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        schools.push(key);
    });
});

ref = database.ref("Students/");
studentsid = new Array();
ref.once("value").then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        studentsid.push(key);
    });
});


app.get("/", function (req, res) {
    res.render('index');
});


app.get("/schools", function (req, res) {
    var refri = database.ref("Schools/");
    var viewschools = new Array();

    refri.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            viewschools.push({
                parent: key,
                child: childData
            });
        });
    });
    setTimeout(function () {
        res.render('viewSchools.ejs', {
            viewschools
        });
    }, 1000);

});

app.get("/school_reg", function (req, res) {
    schooldetails = {
        schoolname: null,
        facultyname: null,
        facultyemail: null,
        facultyphonono: null
    };
    res.render('schoolRegistration');
});

app.get("/student_reg", function (req, res) {
    studentdetails = {
        id: null,
        name: null,
        school: null,
        category: null,
        gender: null
    };
    res.render('studentRegistration', {
        schools,
        studentsid
    });
});

app.get("/edit_student", function (req, res) {
    setTimeout(function() {
        res.render('editStudent', {
            schools,
            editStudent
        }); 
    },1000);
    editStudent = {
        id: null,
        name: null,
        category: null,
        gender: null,
        school: null,
    };
});


app.post("/reg_school", function (req, res) {
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
    schools.push(schooldetails.schoolname);
    writeSchoolData();
    res.redirect('/school_reg');
});

app.post("/reg_student", function (req, res) {
    var uid = req.body.uid;
    var str = req.body.name;
    var str1 = capitalize(str);
    studentdetails = {
        id: uid,
        name: str1,
        category: req.body.category,
        gender: req.body.gender,
        school: req.body.school,
    };
    writeStudentData(studentdetails);
    studentsid.push(uid);
    res.redirect('/student_reg');
});

app.post("/student_edit", function (req, res) {
    var uid = req.body.uid;
    var str = req.body.name;
    var str1 = capitalize(str);
    editStudent = {
        id: uid,
        name: str1,
        category: req.body.category,
        gender: req.body.gender,
        school: req.body.school,
    };
    writeStudentData(editStudent);
    res.redirect('/edit_student');
});

app.post("/return_student", function(req, res) {
    var id = req.body.uid;
    var student = readOneStudent(id);
    res.redirect("/edit_student")
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

function capitalize(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
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

function writeStudentData(studentdetails) {
    firebase.database().ref('Students/' + studentdetails.id).set({
        stdName: studentdetails.name,
        category: studentdetails.category,
        gender: studentdetails.gender,
        school: studentdetails.school
    });
    var id = studentdetails.id;
    var student = {};
    student[id] = studentdetails.name;
    firebase.database().ref().child('Schools/' + studentdetails.school + '/Students/')
        .update(student);
}

function validateId(uid) {
    for (var i = 0; i < studentsid.length; i++) {
        if (studentsid[i] == uid) {
            return false;
        }
    }
    return true;
}

function readOneStudent(editId) {
    
    ref = database.ref("Students/");
    studentsid = new Array();
    ref.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            if(key == editId) {
                temp = childSnapshot.val();
                console.log(temp);
                console.log("category " + temp.Category )
                editStudent.uid = key;
                editStudent.name = temp.stdName;
                editStudent.category = temp.Category;
                editStudent.school = temp.school;
                editStudent.gender = temp.gender;
            }
            studentsid.push(key);
            //console.log(childSnapshot.val());
        });
    });
    
}
