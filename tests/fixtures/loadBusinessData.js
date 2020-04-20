/* This is run as a standalone node script to load the .csv data file into MongoDB */
/* data.csv from the current directory */

const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose')

//db connection and mongoose models
//require('../../src/db/mongoose')
const User = require('../../src/models/user')
const Segment = require('../../src/models/segment')
const Family = require('../../src/models/family')
const ResourceClass = require('../../src/models/resourceclass')
const Commodity = require('../../src/models/commodity')

// already processed caches
let segCache = {}
let famCache = {}
let classCache = {}
let commCache = {}

/* ----------------------------------------------------------------------------------------------------------*/

const processSegment = async (segId, name) => {
    
  // check to see if the segment exists and if not then add it

  try {

    if (segCache[segId]){
        // already processed this Segment, just return the mondodb id

        //console.log('Exists in Seg cache, already processed ' + segId + ' : ' + segCache[segId])
        return segCache[segId]
    }

    const newSegment = new Segment({
       segmentId : segId,
       name : name
    });
            
    const newSeg = await newSegment.save(); 
    
    // add to cache
    segCache[segId] = newSeg._id;
    //console.log('add to segment cache')
    return newSeg._id
             
  } catch (e) {

      console.log('Exception in processSegment ' + e)
      return "exception"

  }
}

/* ----------------------------------------------------------------------------------------------------------*/

const processFamily = async (famId, name, owner) => {

  // check to see if the family exists and if not then add it

  try {

    if (famCache[famId]){
      // already processed this Family, just return the mondodb id

      //console.log('Exists in Fam cache, already processed ' + famId + ' : ' + famCache[famId])
      return famCache[famId]
    }
     
    const newFamily = new Family({
       familyId : famId,
       name : name,
       familyowner : owner
    });
            
    const newFam = await newFamily.save(); 
     
    // add to cache
    famCache[famId] = newFam._id;
    //console.log('add to family cache')
    
    return newFam._id
               
  } catch (e) {

      console.log('Exception in processFamily ' + e)
      return "exception"

  }
}

/* ----------------------------------------------------------------------------------------------------------*/

const processClass = async (classId, name, owner) => {

  // check to see if the resourcelass exists and if not then add it

  try {

    if (classCache[classId]){
      // already processed this Class, just return the mondodb id

      //console.log('Exists in Class cache, already processed ' + classId + ' : ' + classCache[classId])
      return classCache[classId]
    }

    const newClass = new ResourceClass({
    resourceclassId : classId,
    name : name,
    resourceclassowner : owner
    });

    const newRes = await newClass.save();
    
    // add to cache
    classCache[classId] = newRes._id;
    //console.log('add to process cache')

    return newRes._id
              
  } catch (e) {

      console.log('Exception in processClass ' + e)
      return "exception"

  }
}

/* ----------------------------------------------------------------------------------------------------------*/

const processCommodity = async (commodityId, name, owner) => {

  // check to see if the commodity exists and if not then add it

  try {

    if (commCache[commodityId]){
      // already processed this community, just return the mondodb id

      //console.log('Exists in Comm cache, already processed ' + commodityId + ' : ' + commCache[commodityId])
      return commCache[commodityId]
    }
   
    const newCommodity = new Commodity({
    commodityId : commodityId,
    name : name,
    commodityowner : owner
    });

    const newComm = await newCommodity.save(); 

    // add to cache
    commCache[commodityId] = newComm._id;
    //console.log('add to community cache')

    return newComm._id
    
  } catch (e) {

      console.log('Exception in processCommodity ' + e)
      return "exception"

  }
}

const removeExistingDBData = async () => {

  console.log('Removing Existing DB Data')

  await Commodity.deleteMany()
  await ResourceClass.deleteMany()
  await Family.deleteMany()
  await Segment.deleteMany()
  await User.deleteMany()

  console.log('Removing Existing DB Data COMPLETED')

}

// -----------------------------------------------------------------------------
// Main entry point invoked by running this .js file
// load in the Segment, Family, Class and Commody Information from the .csv file
// -----------------------------------------------------------------------------

const processDomainData = async () => {
  
  const fName = path.join(__dirname, 'data.csv')
  let csvData = []; // array to hold csv data after parsed

  //first remove existing data
  await removeExistingDBData()

  segCache = {}
  famCache = {}
  classCache = {}
  commCache = {}    

  // stream from and parse the csv file
  fs.createReadStream(fName)
    .pipe(csv())
    .on('data',  (row) => {

        csvData.push(row);  

    }).on('end', async () => {
        
        console.log('CSV file successfully parsed');

        // use a regular for loop, the ForEach blocks on the inner anonymous function, not the for loop as needed

        console.log('----STARTING DATA LOAD----')

        await blockingLoop(csvData)
              
    })
   
}

const blockingLoop = async (dataArray) => {

  let segId, famId, resClassId, CommId

  for (i=0; i< dataArray.length; i++){
    //console.log(dataArray[i].Segment, dataArray[i].SegmentName)
    segId = await processSegment(dataArray[i].Segment, dataArray[i].SegmentName)
    
    if (segId !== "exception") {
         famId = await processFamily(dataArray[i].Family, dataArray[i].FamilyName, segId)

        if (famId !== "exception"){
            resClassId = await processClass(dataArray[i].Class, dataArray[i].ClassName, famId)
         
            if (resClassId !== "exception") {
                 commId = await processCommodity(dataArray[i].Commodity, dataArray[i].CommodityName, resClassId)

                 if (commId === "exception") {
                     console.log('Failure to process a Commodity - load halted')
                     return
                 }

            } else {
                console.log('Failure to process a Resource Class - load halted')
                return
            }     
        
        } else {
            console.log('Failure to process a Family - load halted')
            return
        }
               
    } else {
        console.log('Failure to process a Segment - load halted')
        return
    }
    
  }

  console.log('----ENDING DATA LOAD----')
  //mongoose.disconnect()
  
}

//console.log('----STARTING-----')
//processDomainData()

module.exports = {
  processDomainData
}


