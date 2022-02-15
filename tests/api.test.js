// for postman
pm.globals.set("variable_keyid", "1");
pm.globals.set("variable_keyfullname", "ihimekpen osemudiamen andrew");
pm.globals.set("variable_keyemail", "oihimekpen@gmail.com");
pm.globals.set("variable_keypassword", "qwerty");


// test for status code 
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Get User by Id functionality", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.id).to.eql(pm.environment.get("variable_keyid"));
    // pm.expect(jsonData.fullname).to.eql(pm.environment.get("variable_keyfullname"));
    // pm.expect(jsonData.email).to.eql(pm.environment.get("variable_keyemail"));
    // pm.expect(jsonData.password).to.eql(pm.environment.get("variable_keypassword"));
});