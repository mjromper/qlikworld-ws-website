const BASEURL = "https://use.cloudshare.com/api/v3/class";
const axios = require("axios");
const sha1 = require("js-sha1");

const API_KEY = process.env.CLOUDSHARE_API_KEY;
const API_ID = process.env.CLOUDSHARE_API_ID;

function randomString(length) {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function getRequestAuth(url) {
  var timestamp = Math.floor(Date.now() / 1000);
  var token = randomString(10);
  var hmac = `${API_KEY}${url}${timestamp}${token}`;
  var hmacSHA1 = sha1(hmac);

  return `cs_sha1 userapiid:${API_ID};timestamp:${timestamp};token:${token};hmac:${hmacSHA1}`;

};

async function _getAllStudentsInClass(classId) {
  var url = `${BASEURL}/${classId}/students?isFull=false`;
  var auth = getRequestAuth(url);

  try {
    var result = await axios({
      method: "GET",
      url: url,
      headers: {
        Accpet: "application/json",
        "Content-Type": "application/json",
        Authorization: auth,
      },
    });

    return result.data;
  } catch (error) {
    return {error: error};
  }
};

async function _sendInvitationToUser(classId, userId) {
  var url = `${BASEURL}/actions/sendinvitations?isMultiple=true`;
  var auth = getRequestAuth(url);

  try {
    var result = await axios({
      method: "POST",
      url: url,
      headers: {
        Accpet: "application/json",
        "Content-Type": "application/json",
        Authorization: auth,
      },
      data: {
        classId: classId,
        studentIds: [userId],
      },
    });
    return result.data;
  } catch (error) {
    return {error: error};
  }
}

async function _addUser(classId, email) {
  var url = `${BASEURL}/${classId}/Students`;
  var auth = getRequestAuth(url);

  var firstName = email.split("@")[0];
  var lastName = email.split("@")[1];

  try {
    var result = await axios({
      method: "POST",
      url: url,
      headers: {
        Accpet: "application/json",
        "Content-Type": "application/json",
        Authorization: auth,
      },
      data: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        properties: {},
      },
    });

    return result.data;
  } catch (error) {
    return {error: error};
  }
}

var addStudentToClass = async function (details, email) {
  
  var classId = details.classId;
  console.log(`Executed 'Add Student' to class '${classId}' for user '${email}'`);
  
  var students = await _getAllStudentsInClass(classId);

  var student = students.find(function (user) {
    return user.email === email;
  });

  if (student) {
    console.log(`Student already in class (${classId}), sending invitation:  ${student.email}` );
    return await _sendInvitationToUser(classId, student.id);
  } else {
    console.log(`Adding student to class (${classId}):  ${email}`);
  
    student = await _addUser(classId, email);
    console.log(`Student Added to class (${classId}):  ${email}`);
    console.log(`Student:`, student);
    
    return await _sendInvitationToUser(classId, student.studentId);
       
  }
};

module.exports.addStudentToClass = addStudentToClass;
