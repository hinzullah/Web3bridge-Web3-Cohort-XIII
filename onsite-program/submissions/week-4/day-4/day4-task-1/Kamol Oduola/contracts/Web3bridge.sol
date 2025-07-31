// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract Web3bridge{
    
    enum Role{
        mediaTeam,
        mentors,
        managers,
        socialMediaTeam,
        technicians_supervisors,
        kitchen_staff
    }

    struct Employee{
        string name;
        Role role;
        bool isEmployed;
    }

    mapping(address => Employee) public employees;
    address[] public employeesList;

    function addEmployee(address _employeeAddress, string memory _name, Role _role) external {
        employees[_employeeAddress] = Employee(_name, _role, true);
        employeesList.push(_employeeAddress);
    }

    function updateEmployee(address _employeeAddress, string memory name, Role _role) external {
        require(employees[_employeeAddress].isEmployed == true, "Employee is not employed");
        employees[_employeeAddress].name = name;
        employees[_employeeAddress].role = _role;
        employees[_employeeAddress].isEmployed = true;
    }
        
    function canAccessGarage(address _employeeAddress) public view returns (bool) {
    Employee memory emp = employees[_employeeAddress];

    if (!emp.isEmployed) {
        return false;
    }

    if (
        emp.role == Role.mediaTeam ||
        emp.role == Role.mentors ||
        emp.role == Role.managers
    ) {
        return true;
    }

    return false;
}
}