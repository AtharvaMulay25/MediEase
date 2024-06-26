/*
THIS PURCHASE TABLE NEEDS TO BE UPDATED AND THEN ALL ITS ROUTES**
*/
//prisma client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ExpressError = require("../utils/ExpressError");

//for serializing BigInt to JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// @desc    Get Purchase Details
// route    GET /api/purchase/:id
// @access  Private (Admin)
const getPurchaseDetails = async (req, res, next) => {
  const { id } = req.params;
  const purchaseDetails = await prisma.purchaseList.findUnique({
    where: {
      id: id,
    },
    include: {
      Purchase: {
        include: {
          Medicine: {
            select: {
              id: true,
              brandName: true,
            },
          },
        },
      },
      Supplier: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  if (!purchaseDetails) {
    throw new ExpressError("Purchase Details does not exist", 404);
  }

  const restructuredPurchaseDetails = {
    supplierName: purchaseDetails.Supplier.name,
    supplierId: purchaseDetails?.Supplier?.id,
    purchaseDate: purchaseDetails.purchaseDate.toISOString().split("T")[0],
    invoiceNo: purchaseDetails.invoiceNo,
    details: purchaseDetails.Details,
    medicines: purchaseDetails.Purchase.map((purchase) => ({
      medicineId: purchase.Medicine.id,
      name: purchase.Medicine.brandName,
      batchNo: purchase.batchNo.toString(),
      mfgDate: purchase.mfgDate
        ? purchase.mfgDate.toISOString().split("T")[0]
        : "",
      expDate: purchase.expiryDate.toISOString().split("T")[0],
      totalQuantity: purchase.quantity,
    })),
  };

  return res.status(200).json({
    ok: true,
    data: restructuredPurchaseDetails,
    message: "Puchase Details retrieved successfully",
  });
};

// @desc    Get Purchase List
// route    GET /api/purchase/list
// @access  Private (Admin)
const getPurchaseList = async (req, res, next) => {
  const purchaseList = await prisma.purchaseList.findMany({
    include: {
      Purchase: true,
      Supplier: {
        select: {
          name: true,
        },
      },
    },
  });

  const restructuredPurchaseList = purchaseList.map((purchase) => ({
    id: purchase.id,
    supplierName: purchase.Supplier.name,
    purchaseDate: purchase.purchaseDate.toISOString().split("T")[0],
    invoiceNo: purchase.invoiceNo,
    details: purchase.Details,
    // purchaseItems: purchase.Purchase
  }));

  console.log(restructuredPurchaseList);

  return res.status(200).json({
    ok: true,
    data: restructuredPurchaseList,
    message: "Puchase List retrieved successfully",
  });
};

// @desc    Create Purchase List Records
// route    POST /api/purchase/create
// @access  Private (Admin)
const createPurchaseList = async (req, res, next) => {
  const {
    purchaseDate,
    invoiceNo,
    supplierId,
    purchaseDetails,
    purchaseItems,
  } = req.body;
  console.log(purchaseDate);
  console.log(req.body);

  const supplier = await prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
  });

  if (!supplier) {
    throw new ExpressError("Supplier does not exist", 404);
  }

  const invoiceNoRecord = await prisma.purchaseList.findUnique({
    where: {
      invoiceNo: invoiceNo,
    },
  });

  if (invoiceNoRecord) {
    throw new ExpressError("Invoice No already exists", 400);
  }

  //handling validations on each purchase item
  let stockRecords = [];
  for (const [idx, purchase] of purchaseItems.entries()) {
    // console.log("idx: " , idx, purchase);
    const medicineRecord = await prisma.medicine.findUnique({
      where: {
        id: purchase.medicineId,
      },
    });
    if (!medicineRecord) {
      throw new ExpressError(
        `Medicine with ID ${purchase.medicineId} does not exist in ITEM ${
          idx + 1
        }`,
        404
      );
    }

    const batchNoRecord = await prisma.purchase.findUnique({
      where: {
        batchNo: purchase.batchNo,
      },
    });
    if (batchNoRecord) {
      throw new ExpressError(
        `Batch No ${purchase.batchNo} already exists in ITEM ${idx + 1}`,
        400
      );
    }

    const stockRecord = await prisma.stock.findFirst({
      where: {
        medicineId: purchase.medicineId,
      },
    });

    if (stockRecord) {
      stockRecords.push(stockRecord);
    }

    if (purchase.expiryDate <= purchase.mfgDate) {
      throw new ExpressError(
        `Expiry Date cannot be less than Manufacturing Date in ITEM ${idx + 1}`,
        400
      );
    }
    if (purchase.mfgDate >= purchaseDate) {
      throw new ExpressError(
        `Mfg. Date cannot be greater than Purchase Date in ITEM ${idx + 1}`,
        400
      );
    }
    if (purchase.expiryDate < purchaseDate) {
      throw new ExpressError(
        `Expiry Date cannot be less than Purchase Date in ITEM ${idx + 1}`,
        400
      );
    }
  }

  //updating the stock
  // //updating the stock
  // for (const [idx, purchase] of purchaseItems.entries()) {
  //   const stockRecord = await prisma.stock.findFirst({
  //     where: {
  //       medicineId: purchase.medicineId,
  //     },
  //   });
  //   //using if else upserting the stock
  //   let updateStock, newStock;
  //   if (stockRecord) {
  //     updateStock = await prisma.stock.update({
  //       where: {
  //         id: stockRecord.id,
  //       },
  //       data: {
  //         inQuantity: {
  //           increment: purchase.quantity,
  //         },
  //         stock: {
  //           increment: purchase.quantity,
  //         },
  //       },
  //     });
  //   }
  //   else {
  //     newStock = await prisma.stock.create({
  //       data: {
  //         medicineId: purchase.medicineId,
  //         stock: purchase.quantity,
  //         inQuantity: purchase.quantity,
  //         outQuantity: 0,
  //       },
  //     });
  //     //if error in upserting stock
  //   }
  //   if ((stockRecord && !updateStock) || (!stockRecord && !newStock) ) {
  //     //rollback all the previous stock updates
  //     for (let i = 0; i < idx; i++) {
  //       const previousPurchase = purchaseItems[i];
  //       const previousStockRecord = await prisma.stock.findFirst({
  //         where: {
  //           medicineId: previousPurchase.medicineId,
  //         },
  //       });

  //       const previousStock = await prisma.stock.update({
  //         where: {
  //           id: previousStockRecord.id,
  //         },
  //         data: {
  //           inQuantity: {
  //             decrement: previousPurchase.quantity,
  //           },
  //           stock: {
  //             decrement: previousPurchase.quantity,
  //           },
  //         },
  //       });

  //       if (!previousStock) {
  //         throw new ExpressError(
  //           `Failed to rollback stock update for medicine with ID ${
  //             previousPurchase.medicineId
  //           } in ITEM ${i + 1}`,
  //           500
  //         );
  //       }
  //     }

  //     throw new ExpressError(`Failed to update stock for medicines`, 404);
  //   }
  // }
  const upsertData = purchaseItems.map((purchase, idx) => {
    return prisma.stock.upsert({
      where: { id: stockRecords[idx]?.id || "" },
      update: {
        inQuantity: { increment: purchase.quantity },
        stock: { increment: purchase.quantity },
      },
      create: {
        medicineId: purchase.medicineId,
        stock: purchase.quantity,
        inQuantity: purchase.quantity,
        outQuantity: 0,
      },
    });
  });
  const updateStock = await prisma.$transaction(upsertData);

  if (!updateStock) {
    throw new ExpressError("Stock Update failed", 500);
  }

  const createdRecord = await prisma.purchaseList.create({
    data: {
      purchaseDate: purchaseDate + "T00:00:00Z",
      invoiceNo: invoiceNo,
      supplierId,
      Details: purchaseDetails, //change Details name to details in schema*******
      Purchase: {
        create: purchaseItems.map((item) => {
          const newItem = {
            medicineId: item.medicineId,
            quantity: item.quantity,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate + "T00:00:00Z",
          };
          if (item.mfgDate) {
            newItem.mfgDate = item.mfgDate + "T00:00:00Z";
          }
          return newItem;
        }),
      },
    },
  });
  console.log("createRecord ", createdRecord);
  return res.status(200).json({
    ok: true,
    data: createdRecord,
    message: "Puchase List record created successfully",
  });
};

// @desc    Update Purchase List Record
// route    PUT /api/purchase/update
// @access  Private (Admin)
const updatePurchaseList = async (req, res, next) => {
  const { id } = req.params;
  const {
    purchaseDate,
    invoiceNo,
    supplierId,
    purchaseDetails,
    purchaseItems,
  } = req.body;
  // const {} = purchaseListEntry;
  console.log(purchaseDate);
  //   console.log(purchaseItems);

  const supplier = await prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
  });

  if (!supplier) {
    throw new ExpressError("Supplier does not exist", 404);
  }

  const invoiceNoRecord = await prisma.purchaseList.findUnique({
    where: {
      invoiceNo: invoiceNo,
    },
  });

  // if (invoiceNoRecord) {
  //   throw new ExpressError("Invoice No already exists", 400);
  // }

  //handling validations on each purchase item
  let stockPurchaseItemsRecords = [];
  for (const [idx, purchase] of purchaseItems.entries()) {
    const medicineRecord = await prisma.medicine.findUnique({
      where: {
        id: purchase.medicineId,
      },
    });
    if (!medicineRecord) {
      throw new ExpressError(
        `Medicine with ID ${purchase.medicineId} does not exist in ITEM ${
          idx + 1
        }`,
        404
      );
    }

    const batchNoRecord = await prisma.purchase.findUnique({
      where: {
        batchNo: purchase.batchNo,
      },
    });
    // if (batchNoRecord) {
    //   throw new ExpressError(
    //     `Batch No ${purchase.batchNo} already exists in ITEM ${idx + 1}`,
    //     400
    //   );
    // }

    const stockRecord = await prisma.stock.findFirst({
      where: {
        medicineId: purchase.medicineId,
      },
    });
    //*** no need of this condition */
    // if (!stockRecord) {
    //   throw new ExpressError(
    //     `Stock record does not exist for medicine with ID ${
    //       purchase.medicineId
    //     } in ITEM ${idx + 1}`,
    //     404
    //   );
    // } 
    if(stockRecord){ 
      stockPurchaseItemsRecords.push(stockRecord);
    }


    if (purchase.expiryDate <= purchase.mfgDate) {
      throw new ExpressError(
        `Expiry Date cannot be less than Manufacturing Date in ITEM ${idx + 1}`,
        400
      );
    }
    if (purchase.mfgDate >= purchaseDate) {
      throw new ExpressError(
        `Mfg. Date cannot be greater than Purchase Date in ITEM ${idx + 1}`,
        400
      );
    }

    if (purchase.expiryDate < purchaseDate) {
      throw new ExpressError(
        `Expiry Date cannot be less than Purchase Date in ITEM ${idx + 1}`,
        400
      );
    }
  }

  //handling stock update validations
  let stockPastPurchaseItemsRecords = [];
  const pastPurchaseItems = await prisma.purchase.findMany({  
    where: {
      purchaseListId: id,
    },
  });
  for (const [idx, purchase] of pastPurchaseItems.entries()) 
  {
    const newPurchase = purchaseItems.find((item) => item.medicineId === purchase.medicineId);
    const currStock = await prisma.stock.findFirst({
      where: {
        medicineId: purchase.medicineId,
      },
    });
    if(currStock)
      {
        stockPastPurchaseItemsRecords.push(currStock);
      }
    if(newPurchase){
      if(newPurchase.quantity < purchase.quantity){
        const diff = purchase.quantity - newPurchase.quantity;
        if(diff > currStock.stock){
          throw new ExpressError(`Cannot Update Stock for medicine item ${idx + 1} on updating Purchase`, 401)
        }
      }
    }
    else{
      if(purchase.quantity > currStock.stock){
        throw new ExpressError(`Cannot Update Stock for medicine item ${idx + 1} on updating Purchase`, 401)
      }    
    }
  }
  const upsertDataPurchase = purchaseItems.map((purchase, idx) => {
    const pastPurchase = pastPurchaseItems.find((item) => item.medicineId === purchase.medicineId);
    const diff = pastPurchase ? purchase.quantity - pastPurchase.quantity : purchase.quantity;
    return prisma.stock.upsert({
      where: { id: stockPurchaseItemsRecords[idx]?.id || "" }, //**** "" in case of creating when stock record doesn't exists */
      update: {
        inQuantity: { increment: diff },
        stock: { increment: diff },
      },
      create: {
        medicineId: purchase.medicineId,
        stock: purchase.quantity,
        inQuantity: purchase.quantity,
        outQuantity: 0,
      },
    });
  });

  //entry exists in past purchase but not in current purchase
  const upsertDataPastPurchase = pastPurchaseItems.filter((purchase, idx)=>{
    const newPurchase = purchaseItems.find((item) => item.medicineId === purchase.medicineId);
    return !newPurchase;
  }).map((purchase, idx) => {
    const diff =  purchase.quantity;  
    return prisma.stock.upsert({
      where: { id: stockPastPurchaseItemsRecords[idx]?.id || "" }, //**** "" in case of creating when stock record doesn't exists */
      update: {
        inQuantity: { decrement: diff },
        stock: { decrement: diff },
      },
      create: {
        medicineId: purchase.medicineId,
        stock: purchase.quantity,
        inQuantity: purchase.quantity,
        outQuantity: 0,
      },
    });
  });

  const upsertData = [...upsertDataPurchase, ...upsertDataPastPurchase];
  const updateStock = await prisma.$transaction(upsertData);
  if (!updateStock) {
    throw new ExpressError("Stock Update failed", 500);
  }

  const updatePurchase = await prisma.purchase.deleteMany({
    where: {
      purchaseListId: id,
    },
  });

  const updatePurchaseList = await prisma.purchaseList.update({
    where: {
      id: id,
    },
    data: {
      purchaseDate: purchaseDate + "T00:00:00Z",
      invoiceNo: invoiceNo,
      supplierId,
      Details: purchaseDetails, //change Details name to details in schema*******
      Purchase: {
        create: purchaseItems.map((item) => {
          const newItem = {
            medicineId: item.medicineId,
            quantity: item.quantity,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate + "T00:00:00Z",
          };
          if (item.mfgDate) {
            newItem.mfgDate = item.mfgDate + "T00:00:00Z";
          }
          return newItem;
        }),
      },
    },
  });

  // console.log("updateRecord ", updatePurchaseList);

  return res.status(200).json({
    ok: true,
    data: updatePurchaseList,
    message: "Puchase List record updated successfully",
  });
};

// @desc    Delete Purchase List Record
// route    DELETE /api/purchase/delete
// @access  Private (Admin)
const deletePurchaseList = async (req, res, next) => {
  const { id } = req.params;
  console.log("id: ", id);
  const purchaseListRecord = await prisma.purchaseList.findUnique({
    where: {
      id,
    },
  });
  if (!purchaseListRecord) {
    throw new ExpressError("Purchase List Record doesn't exist", 404);
  }
  const purchaseItems = await prisma.purchase.findMany({
    where: {
      purchaseListId: id,
    },
  });

  //handling validations
  let stockRecords = [];
  for (const [idx, purchase] of purchaseItems.entries()) {
    const stockRecord = await prisma.stock.findFirst({
      where: {
        medicineId: purchase.medicineId,
      },
    });
    if (!stockRecord) {
      throw new ExpressError(
        `Stock record does not exist for medicine with ID ${
          purchase.medicineId
        } in ITEM ${idx + 1}`,
        404
      );
    } else {
      stockRecords.push(stockRecord);
    }

    if (stockRecord.inQuantity - purchase.quantity < stockRecord.outQuantity) {
      throw new ExpressError(
        `Cannot Update Stock for medicine item ${
          idx + 1
        } on deleting the Purchase`,
        401
      );
    }
  }

  // update the stock here before deleting the purchase
  const upsertData = purchaseItems.map((purchase, idx) => {
    return prisma.stock.upsert({
      where: { id: stockRecords[idx].id || ""},
      update: {
        inQuantity: { decrement: purchase.quantity },
        stock: { decrement: purchase.quantity },
      },
      create: {
        medicineId: purchase.medicineId,
        stock: 0,
        inQuantity: 0,
        outQuantity: 0,
      },
    });
  });
  const updateStock = await prisma.$transaction(upsertData);

  if (!updateStock) {
    throw new ExpressError("Stock Update failed", 500);
  }

  const deletedRecords = await prisma.purchase.deleteMany({
    where: {
      purchaseListId: id,
    },
  });
  const deletedPuchase = await prisma.purchaseList.delete({
    where: {
      id,
    },
  });
  return res.status(200).json({
    ok: true,
    data: deletedRecords,
    message: "Puchase List Record deleted successfully",
  });
};

module.exports = {
  getPurchaseList,
  createPurchaseList,
  updatePurchaseList,
  deletePurchaseList,
  getPurchaseDetails,
};
