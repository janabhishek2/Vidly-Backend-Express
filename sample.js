const bcrypt=require('bcryptjs');

async function run()
{
    const salt=await bcrypt.genSalt(0);
    const a=await bcrypt.hash("1234",salt);
    const b=await bcrypt.hash("5678",salt);
    console.log(a);
    console.log(b);
}

run();
