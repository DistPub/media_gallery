import binascii


def generate_file(file, rows):
    bom = binascii.unhexlify(''.join("EF BB BF".split()))
    file.write(bom)
    lines = ['","'.join(row) for row in rows]
    file.writelines([f'"{line}"\n'.encode() for line in lines])
    return file
