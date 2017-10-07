var express = require("express"),
    app = express(),
    path = __dirname + '/views/',
    router = express.Router(),
    bodyParser = require('body-parser'),
    firebase = require('firebase'),
    admin = require("firebase-admin");

var serviceAccount = require("./aarohan2017-61ac6-firebase-adminsdk-8wijo-a82e4e4e19.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aarohan2017-61ac6.firebaseio.com" 
});



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

var editstudent = {
    id: null,
    name: null,
    school: null,
    category: null,
    gender: null
}

var eventdetails = {
        name: null,
        category: null,
        grpcount: null
};

//firebase.initializeApp(config);
var database = admin.database();

var ref = database.ref("Schools/");
schools = new Array();
ref.once("value").then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        schools.push(key);
        console.log(key);
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

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: false
})); // to support URL-encoded bodie


app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname + '/public'));
app.set('views', path);
app.set('view engine', 'ejs');


app.get("/", function (req, res) {
    res.render('index');
});


app.get("/schools", function (req, res) {
    var viewschools = new Array();
    getAllSchools(function(viewschools) {
       res.render('viewSchools.ejs', {
        viewschools
       }); 
    });   
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

app.get("/event_reg", function(req, res) {
    eventdetails = {
        name: null,
        category: null,
        grpcount: null
    };
    res.render('eventRegistration');
})

app.get("/edit_student", function (req, res) {
    res.render('editStudent', {
        schools,
        editstudent,
        studentsid
    }); 
    editstudent = {
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

app.post("/reg_event", function(req, res){
    eventdetails = {
        name: req.body.name,
        category: req.body.category,
        grpcount: req.body.grpcount
    };
    console.log(eventdetails);
    writeEventdata();
    setTimeout(function() {
        res.redirect('/event_reg');
    },500);
    
    
});

app.post("/student_edit", function (req, res) {
    var uid = req.body.uid;
    var str = req.body.name;
    var str1 = capitalize(str);
    editstudent = {
        id: uid,
        name: str1,
        category: req.body.category,
        gender: req.body.gender,
        school: req.body.school,
    };
    writeStudentData(editstudent);
    res.redirect('/edit_student');
});

;app.post("/return_student", function(req, res) {
    var id = req.body.uid;
    readOneStudent(id,function() {
       
        res.redirect("/edit_student");
    });
    
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
    database.ref('Schools/' + schooldetails.schoolname).set({
        faculty: {
            name: schooldetails.facultyname,
            email: schooldetails.facultyemail,
            phoneno: schooldetails.facultyphonono
        },
        chequename: schooldetails.chequename
    },function(error) {
        if(error) {
        console.log("school Registration failed");
        }
    });
}

function writeStudentData(studentdetails) {
    database.ref('Students/' + studentdetails.id).set({
        stdName: studentdetails.name,
        category: studentdetails.category,
        gender: studentdetails.gender,
        school: studentdetails.school
    });
    var id = studentdetails.id;
    var student = {};
    student[id] = studentdetails.name;
    database.ref().child('Schools/' + studentdetails.school + '/Students/')
        .update(student);
}

function writeEventdata() {

  database.ref('Events/'+ eventdetails.name).set({
        Category: eventdetails.category,
        grpCount: eventdetails.grpcount
  });
}

function validateId(uid) {
    for (var i = 0; i < studentsid.length; i++) {
        if (studentsid[i] == uid) {
            return false;
        }
    }
    return true;
}

function readOneStudent(editId, callb) {
    ref = database.ref("Students/");
    ref.once("value").then( function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            if(key == editId) {
                temp = childSnapshot.val();
                console.log(temp);
                console.log("category " + temp.category )
                editstudent.uid = key;
                editstudent.name = temp.stdName;
                editstudent.category = temp.category;
                editstudent.school = temp.school;
                editstudent.gender = temp.gender;
                console.log("true");
                callb();
                
            }
            //console.log(childSnapshot.val());
        });
        console.log("end foreach");
        callb();
    }).catch(function(err) {
        console.log("firebase error");
        callb();
   });   
}

function getAllSchools(cb) {
    var refri = database.ref("Schools/");
    viewschools = new Array();

    refri.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            viewschools.push({
                parent: key,
                child: childData
            });
        });
        cb(viewschools);
    });
}
