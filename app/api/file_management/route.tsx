import fs from 'fs/promises';
import path from 'path';

export async function GET(request: any) {
    // 从请求 URL 中解析查询参数
    const { searchParams } = new URL(request.url);
    // 获取传递的文件名或路径，没有传则使用默认文件名
    const relativePath = searchParams.get('path');
    if (!relativePath) {
        return new Response('No file path provided', { status: 400 });
    }
    const dataFile = path.join(process.cwd(), 'data', relativePath);
    
    try {
        // 尝试访问文件，如果不存在则会抛出异常
        try {
            await fs.access(dataFile);
        } catch (err) {
            // 如果文件不存在，则创建一个空文件（也可以写入默认内容）
            console.log('File does not exist, creating empty file');
            await fs.writeFile(dataFile, '', 'utf8');
        }
        const fileContent = await fs.readFile(dataFile, 'utf8');
        if (fileContent.length === 0) {
            // 文件内容为空
            console.log('File is empty');
            return new Response(null, { status: 204 });
        }
        // 返回文件内容
        return new Response(fileContent, { status: 200 });
    } catch (error) {
        console.log('Error reading file', error);
        return new Response('Error reading file', { status: 500 });
    }
}
  
export async function POST(request: any) {
    const { searchParams } = new URL(request.url);
    const relativePath = searchParams.get('path') || 'mydata.txt';
    const dataFile = path.join(process.cwd(), 'data', relativePath);

    try {
        // 读取现有数据，如果文件不存在，则初始化为空对象
        let existingData = {};
        try {
            const fileContent = await fs.readFile(dataFile, 'utf8');
            existingData = JSON.parse(fileContent);
        } catch (err) {
            // 如果读取失败，可能文件不存在
            existingData = {};
        }

        // 获取新数据
        const newData = await request.json();

        // 合并现有数据和新数据，新数据覆盖现有数据中相同的键
        const mergedData = { ...existingData, ...newData };
        // 写回文件
        await fs.writeFile(dataFile, JSON.stringify(mergedData, null, 2), 'utf8');
        // // 假设请求体为 JSON，其中包含 content 字段
        // const { content } = await request.json();
        // await fs.writeFile(dataFile, content, 'utf8');
        return new Response('File written successfully', { status: 200 });
    } catch (error) {
        return new Response('Error writing file', { status: 500 });
    }
}