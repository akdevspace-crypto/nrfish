
import { exec } from 'child_process';

const PORT = 8080;

function killPort(port) {
    const command = process.platform === 'win32'
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port} -t`;

    exec(command, (err, stdout, stderr) => {
        if (err || !stdout) {
            console.log(`Port ${port} is free or no process found.`);
            return;
        }

        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];

            if (pid && !isNaN(pid) && parseInt(pid) > 0) {
                console.log(`Killing process ${pid} on port ${port}...`);
                exec(`taskkill /F /PID ${pid}`, (kErr, kOut, kErrOut) => {
                    if (kErr) console.error(`Failed to kill ${pid}:`, kErrOut);
                    else console.log(`Process ${pid} killed.`);
                });
            }
        });
    });
}

killPort(PORT);
