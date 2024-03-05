//prisma client 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

// @desc    Get Supplier List
// route    GET /api/supplier/list
// @access  Private (Admin) 
const getSupplierList = async(req, res, next) => {
    try {
        const supplierList = await prisma.supplier.findMany({});
        console.log(supplierList);  
        
        return res.status(200).json({
            ok: true,
            data: supplierList,
            message: "Supplier List retrieved successfully"
        });
    } catch (err) {
        console.log(`Supplier List Fetching Error : ${err.message}`);
        
        return res.status(500).json({
            ok: false,
            data: [],
            message: "Fetching Supplier list failed, Please try again later"
        });
    }
};

// @desc    Create Supplier List Records
// route    POST /api/supplier/create
// @access  Private (Admin) 
const createSupplierList = async(req, res, next) => {
    try {
        const createdRecord = await prisma.supplier.create({
            data: {
                ...req.body
            }
        });
        
        console.log(createdRecord);  
        
        return res.status(200).json({
            ok: true,
            data: createdRecord,
            message: "Supplier List record created successfully"
        });
    } catch (err) {
        console.log(`Supplier List Creating Error : ${err.message}`);
        
        return res.status(500).json({
            ok: false,
            data: [],
            message: "Creating supplier list failed, Please try again later"
        });
    }
};

// @desc    Update Supplier List Record
// route    PUT /api/supplier/update
// @access  Private (Admin) 
const updateSupplierList = async(req, res, next) => {
    try {
        const { id } = req.body;
        const updatedRecord = await prisma.supplier.update({
            where: {
                id,
            },
            data: {
                ...req.body
            },
        });

        console.log(updatedRecord);  
        
        return res.status(200).json({
            ok: true,
            data: updatedRecord,
            message: "Supplier List record updated successfully"
        });
    } catch (err) {
        console.log(`Supplier List Updating Error : ${err.message}`);
        
        const errMsg = "Updating Supplier list record failed, Please try again later";
        const errCode = 500;

        //record does not exist
        if (err.code === 'P2025') {
            errMsg = "Record does not exist"
            errCode = 404;
        }

        return res.status(errCode).json({
            ok: false,
            data: [],
            message: errMsg,
        });
    }
};


// @desc    Delete Supplier List Record
// route    DELETE /api/supplier/delete
// @access  Private (Admin) 
const deleteSupplierList = async(req, res, next) => {
    try {
        const { id } = req.body;
        
        const deletedRecord = await prisma.supplier.delete({
            where: {
              id: id,
            },
        });
          
        return res.status(200).json({
            ok: true,
            data: deletedRecord,
            message: "Supplier List Record deleted successfully"
        });
    } catch (err) {
        console.log(`Supplier List Deletion Error : ${err.message}`);
        
        const errMsg = "Deleting Supplier list record failed, Please try again later";
        const errCode = 500;

        //record does not exist
        if (err.code === 'P2025') {
            errMsg = "Record does not exist"
            errCode = 404;
        }

        return res.status(errCode).json({
            ok: false,
            data: [],
            message: errMsg,
        });
    }
};


module.exports = {
    getSupplierList, 
    createSupplierList,
    updateSupplierList,
    deleteSupplierList
};