const request = require('supertest')
const app = require('../src/app')
const Segment = require('../src/models/segment')

test('Should create a new segment', async () => {

    // delete the segment in case test is run again
    const segmentdeleted = await Segment.findOneAndDelete({ segmentId: '30000001' })

    const response = await request(app).post('/segments').send({
        segmentId: '30000001',
        name: 'new segment'
    }).expect(201)

    // Assert that the database was changed correctly
    const segment = await Segment.findOne({ segmentId : '30000001' })
    expect(segment).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        segment: {
            name: 'new segment',
            segmentId : '30000001'
        }
    })
 
})

// all the following are based upon data loaded into the system

test('Should not create a duplicate segment', async () => {
    const response = await request(app).post('/segments').send({
        segmentId: '21000000',
        name: 'new dup segment'
    }).expect(400)

})

test('Should read an existing segment', async () => {
    await request(app)
        .get('/segments/21000000')
        .send()
        .expect(200)
})

test('Should not read a non-existing segment', async () => {
    await request(app)
        .get('/segments/99000000')
        .send()
        .expect(404)
})

test('Should update valid user fields', async () => {
    // create a new segment to update    
    const newSeg = {
        segmentId: '96000000',
        name: 'temp seg'
    }

    const segmentTemp = new Segment(newSeg)
    await segmentTemp.save()

    await request(app)
        .patch('/segments/96000000')
        .send({
            name: 'new segment name altered by test'
        })
        .expect(200)

    const segment = await Segment.findOne({ segmentId : '96000000' })
    expect(segment.name).toEqual('new segment name altered by test')

    //now delete the new segment
    await request(app)
        .delete('/segments/96000000')
        .send()
        .expect(200)
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/segments/22000000')
        .send({
            location: 'Philadelphia'
        })
        .expect(400)
})

test('Should delete existing segment', async () => {
    // create a new segment to delete

    const newSeg = {
        segmentId: '95000000',
        name: 'temp seg'
    }

    const segmentTemp = new Segment(newSeg)
    await segmentTemp.save()


    await request(app)
        .delete('/segments/95000000')
        .send()
        .expect(200)
    
        const segment = await Segment.findOne({ segmentId : '95000000' })
        expect(segment).toBeNull()
})

test('Should not delete non-existing segment', async () => {
    await request(app)
        .delete('/segments/40000001')
        .send()
        .expect(404)
})

