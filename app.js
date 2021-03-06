var express = require("express"),
    app = express(),
    path = __dirname + '/views/',
    router = express.Router(),
    bodyParser = require('body-parser'),
    firebase = require('firebase'),
    admin = require("firebase-admin");


  
var serviceAccount = require("./secret.json");

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended: false
})); 
app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname + '/public'));



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aarohan2017-61ac6.firebaseio.com" 
});


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

var editschool = {
    schoolname: null,
    facultyname: null,
    facultyemail: null,
    facultyphonono: null
}

var eventdetails = {
        name: null,
        category: null,
        grpcount: null
};

var ips = new Array();

var database = admin.database();

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



app.set('views', path);
app.set('view engine', 'ejs');

app.get("/login", function(req, res) {
    checkInternet(function(isThere) {
        if(isThere) {
            res.render("login.ejs");

        } else {
            res.render('schoolError');
        }
    });
    
    
});

app.post("/login_post", function(req, res) {
    console.log("Before GO");
    if(req.body.passkey=="GO") {
        console.log("GO");
        ips.push(req.ip);
    }
    res.redirect("/");
});

app.get("/", function (req, res) {
    res.render('index');
});




app.get("/schools", function (req, res, next) {
    checkInternet(function(isThere) {
        if(isThere) {
            console.log("isThere")
            var viewschools = new Array();
            getAllSchools(function(viewschools) {
                res.render('viewSchools.ejs', {
                    viewschools
                }); 
            });
            console.log("after schools")
        } else {
            res.render('schoolError');
        }
    });
    
  
});



app.get("/school_reg", function (req, res) {
    checkInternet(function(isThere) {
        if(isThere) {
        schooldetails = {
            schoolname: null,
            facultyname: null,
            facultyemail: null,
            facultyphonono: null
        };
        setTimeout(function() {
            res.render('schoolRegistration',{
                schools
            });    
        },500);

        } else {
            res.render('schoolError');
        }
    });
    
        
    
});

app.get("/student_reg", function (req, res) {
    checkInternet(function(isThere) {
        if(isThere) {
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


        } else {
            res.render('schoolError');
        }
    });

    
});

app.get("/event_reg", function(req, res) {
    checkInternet(function(isThere) {
        if(isThere) {
        eventdetails = {
            name: null,
            category: null,
            grpcount: null
        };
        res.render('eventRegistration');


        } else {
            res.render('schoolError');
        }
    });    
    
});

app.get("/edit",function(req, res) {
        res.render("edit.ejs");

        
});

app.get("/edit_student", function (req, res) {
    checkInternet(function(isThere) {
        if(isThere) {
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
        } else {
            res.render('schoolError');
        }
    });
    
    
});

app.get("/edit_school", function (req, res) {
    checkInternet(function(isThere) {
        if(isThere) {
        res.render('editSchool', {
                schools,
                editschool
            }); 
            editschool = {
                    schoolname: null,
                    facultyname: null,
                    facultyemail: null,
                    facultyphonono: null
            };
        } else {
            res.render('schoolError');
        }
    });
    
    
});






app.get("/notif", function (req, res) {
    checkInternet(function(isThere) {
            if(isThere) {
            var uids =new Array();
            var id = req.query.uid;
            getPrevilage(function(uids) {
                var arrayLength = uids.length;
                for (var i = 0; i < arrayLength; i++) {
                    if(uids[i]==id){
                        res.render('notification');
                    }
                }
            });

        } else {
            res.render('schoolError');
        }
    }); 
    
    
    
});

app.post("/send_notification", function(req, res) {
    
        var title = req.body.Title;
        var message = req.body.Message;

        var message = { 
            app_id: "460f102c-2f26-4316-b72d-9218696829eb",
            headings:{"en": title},
            contents: {"en": message},
            priority:10,
            included_segments: ["All"]
          };
          sendNotification(message);
          
          res.redirect('/');
          
        
});
    

          
app.post("/reg_school", function (req, res) {
    var sch = req.body.school_name;
    var faq = req.body.faculty_name;
    sch = sch.replace(/^\s+|\s+$/g, "");
    faq = faq.replace(/^\s+|\s+$/g, "");
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
    writeSchoolData(schooldetails);
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

app.post("/school_edit", function (req, res) {
    var sch = req.body.school_name;
    var faq = req.body.faculty_name;
    sch = sch.replace(/^\s+|\s+$/g, "");
    faq = faq.replace(/^\s+|\s+$/g, "");
    sch = capitalize(sch);
    faq = capitalize(faq);
    editschool = {
        schoolname: sch,
        facultyname: faq,
        facultyemail: req.body.faculty_email,
        facultyphonono: req.body.faculty_phoneno,
        chequename: req.body.cheque_name
    };
    //schools.push(edit.schoolname);
    writeSchoolData(editschool);
    res.redirect('/edit_school');
});


app.post("/return_student", function(req, res) {
    var id = req.body.uid;
    readOneStudent(id,function() {
       
        res.redirect("/edit_student");
    });
    
});

app.post("/return_school", function(req, res) {
    var school = req.body.school;
    readOneSchool(school,function() {
       
        res.redirect("/edit_school");
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

function writeSchoolData(schooldetails) {
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

/*function validateId(uid) {
    for (var i = 0; i < studentsid.length; i++) {
        if (studentsid[i] == uid) {
            return false;
        }
    }
    return true;
}*/

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

function readOneSchool(editId, callb) {
    ref = database.ref("Schools/");
    ref.once("value").then( function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            if(key == editId) {
                temp = childSnapshot.val();
                editschool = {
                    schoolname: key,
                    facultyname: temp.faculty.name,
                    facultyemail: temp.faculty.email,
                    facultyphonono: temp.faculty.phoneno
                }
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

function getPrevilage(callb) {
    var refri = database.ref("Notification/");
    var uids =new Array();
    refri.once("value").then(function (snapshot) {
        snapshot.forEach(function(childSnapshot){
                uids.push(childSnapshot.key);  
        });
        callb(uids);
        
    }).catch(function(err) {
        if(err) {
            callb(uids);        
        }
        else {
            callb(uids);
        }
    });  
            
}



function getAllSchools(cb) {
    var refri = database.ref("Schools/");
    viewschools = new Array();
    console.log("here 0");
    refri.once("value").then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            viewschools.push({
                parent: key,
                child: childData
            });
        });
        console.log("here 1");
        cb(viewschools);
    }).catch(function(err) {
        if(err) {
            console.log("Here it comes 2" + err);
            cb(viewschools);
        }
        else {
            cb(viewschools);
        }
    });
}

function checkInternet(cb) {
    require('dns').lookup('google.com',function(err) {
        if (err && err.code == "ENOTFOUND") {
            cb(false);
        } else {
            cb(true);
        }
    })
}

var sendNotification = function(data) {
    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic NDFkMmQ5ZDYtNzFjMS00ZGY4LTg2MTItYzllM2ViOTA4NGQw"
    };

    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };

    var https = require('https');
    var req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
      });
    });

    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
    });

    req.write(JSON.stringify(data));
    req.end();
};